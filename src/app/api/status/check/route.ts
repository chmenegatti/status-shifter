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
  const { datacenter, aggregateId } = await request.json();

  if (!datacenter || typeof datacenter !== "string") {
    return NextResponse.json({ error: "Datacenter é obrigatório." }, { status: 400 });
  }
  if (!aggregateId || typeof aggregateId !== "string") {
    return NextResponse.json({ error: "Aggregate ID é obrigatório." }, { status: 400 });
  }

  const key = DATACENTER_KEY[datacenter];
  if (!key) {
    return NextResponse.json({ error: "Datacenter inválido." }, { status: 400 });
  }

  try {
    const config = await fetchDbConfigFromEtcd(key);
    const pool = getOrCreatePool(key, config);
    const [rows] = await pool.query("SELECT status FROM outbox WHERE aggregate_id = ? LIMIT 1", [aggregateId]);
    const status = (rows as Array<{ status?: string }>)[0]?.status ?? null;
    return NextResponse.json({ status });
  } catch (error) {
    console.error("/api/status/check", error);
    return NextResponse.json({ error: (error as Error).message || "Falha ao consultar status" }, { status: 500 });
  }
}
