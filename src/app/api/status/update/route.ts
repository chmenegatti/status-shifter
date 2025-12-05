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
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        "SELECT osr.id FROM outbox_send_receipt osr WHERE osr.outbox_id IN (SELECT id FROM outbox o WHERE o.aggregate_id = ?)",
        [aggregateId],
      );

      const ids = (rows as Array<{ id: string }>).map((r) => r.id);
      let deletedCount = 0;
      if (ids.length > 0) {
        const placeholders = ids.map(() => "?").join(",");
        await conn.query(`DELETE FROM outbox_send_receipt WHERE id IN (${placeholders})`, ids);
        deletedCount = ids.length;
      }

      const [updateResult] = await conn.query(
        "UPDATE outbox SET status='PENDING' WHERE aggregate_id = ?",
        [aggregateId],
      );

      await conn.commit();

      return NextResponse.json({
        ok: true,
        deletedCount,
        deletedIds: ids,
        updatedRows: (updateResult as any)?.affectedRows ?? 0,
      });
    } catch (err) {
      await conn.rollback();
      console.error("status/update transaction failed", { datacenter, aggregateId, err });
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message || "Falha ao executar queries",
    }, { status: 500 });
  }
}
