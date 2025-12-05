import { NextResponse } from "next/server";
import { fetchDbConfigFromEtcd } from "@/lib/etcd";
import { getOrCreatePool } from "@/lib/db";

const DATACENTER_KEY: Record<string, string> = {
  TECE01: "/nemesis-api/env-tece1",
  TESP02: "/nemesis-api/env-tesp2",
  TESP03: "/nemesis-api/env-tesp3",
  TESP05: "/nemesis-api/env-tesp5",
  TESP06: "/nemesis-api/env-tesp6",
  TESP07: "/nemesis-api/env-tesp7",
};

export async function POST(request: Request) {
  try {
    const { datacenter } = await request.json();
    if (!datacenter || typeof datacenter !== "string") {
      return NextResponse.json({ error: "Datacenter é obrigatório." }, { status: 400 });
    }

    const key = DATACENTER_KEY[datacenter];
    if (!key) {
      return NextResponse.json({ error: "Datacenter inválido." }, { status: 400 });
    }

    const config = await fetchDbConfigFromEtcd(key);
    const pool = getOrCreatePool(key, config);

    // Validate connectivity
    await pool.query("SELECT 1");

    return NextResponse.json({
      ok: true,
      datacenter,
      db: {
        host: config.DBHost,
        name: config.DBName,
      },
    });
  } catch (error) {
    console.error("/api/db/connect", error);
    return NextResponse.json({
      error: (error as Error).message || "Falha ao conectar ao banco",
    }, { status: 500 });
  }
}
