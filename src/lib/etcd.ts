export interface DbConfig {
  DBHost: string;
  DBPort: string;
  DBName: string;
  DBUser: string;
  DBPass: string;
  DBTimeout?: string;
  DBConnsMaxIdle?: number;
  DBConnsMaxOpen?: number;
  DBConnMaxLifetime?: number;
}

function parseEtcdValue(payload: unknown): DbConfig {
  // etcd v2 style: { node: { value: "json" } }
  const maybeNodeValue = (payload as any)?.node?.value;
  const maybeValue = (payload as any)?.value ?? maybeNodeValue ?? payload;
  const raw = typeof maybeValue === "string" ? maybeValue : JSON.stringify(maybeValue);
  try {
    const parsed = JSON.parse(raw) as DbConfig;
    if (!parsed.DBHost || !parsed.DBName || !parsed.DBUser || !parsed.DBPass) {
      throw new Error("Missing required DB config fields in etcd value");
    }
    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse etcd DB config: ${(err as Error).message}`);
  }
}

export async function fetchDbConfigFromEtcd(key: string): Promise<DbConfig> {
  const endpoint = process.env.ETCD_ENDPOINT;
  if (!endpoint) {
    throw new Error("ETCD_ENDPOINT env var is required");
  }

  const trimmed = endpoint.replace(/\/$/, "");
  const isV3 = process.env.ETCD_API_VERSION === "v3" || trimmed.includes("/v3");

  const basicAuth = process.env.ETCD_USERNAME && process.env.ETCD_PASSWORD
    ? Buffer.from(`${process.env.ETCD_USERNAME}:${process.env.ETCD_PASSWORD}`).toString("base64")
    : undefined;

  if (isV3) {
    const url = trimmed.endsWith("/v3/kv/range") ? trimmed : `${trimmed}/v3/kv/range`;
    const keyB64 = Buffer.from(key).toString("base64");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(basicAuth ? { Authorization: `Basic ${basicAuth}` } : {}),
      },
      body: JSON.stringify({ key: keyB64 }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("etcd v3 read failed", { key, url, status: res.status, statusText: res.statusText, body });
      throw new Error(`Failed to read etcd key ${key}: ${res.status} ${res.statusText} ${body}`);
    }

    const payload = await res.json();
    const valueB64 = payload?.kvs?.[0]?.value;
    if (!valueB64) {
      console.error("etcd v3 key not found or empty", { key, url, payload });
      throw new Error(`etcd key ${key} not found`);
    }
    const raw = Buffer.from(valueB64, "base64").toString("utf8");
    return parseEtcdValue(raw);
  }

  // v2 fallback
  const url = `${trimmed}${key.startsWith("/") ? "" : "/"}${key}`;
  const res = await fetch(url, {
    headers: basicAuth ? { Authorization: `Basic ${basicAuth}` } : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("etcd v2 read failed", { key, url, status: res.status, statusText: res.statusText, body });
    throw new Error(`Failed to read etcd key ${key}: ${res.status} ${res.statusText} ${body}`);
  }

  const payload = await res.json();
  return parseEtcdValue(payload);
}
