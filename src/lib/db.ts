import { createPool, type Pool } from "mysql2/promise";
import type { DbConfig } from "@/lib/etcd";

const globalForDb = globalThis as unknown as {
  __dbPools?: Record<string, Pool>;
};

function getPoolMap() {
  if (!globalForDb.__dbPools) {
    globalForDb.__dbPools = {};
  }
  return globalForDb.__dbPools;
}

export function getOrCreatePool(key: string, config: DbConfig): Pool {
  const pools = getPoolMap();
  const existing = pools[key];
  if (existing) return existing;

  const pool = createPool({
    host: config.DBHost,
    port: Number(config.DBPort || 3306),
    user: config.DBUser,
    password: config.DBPass,
    database: config.DBName,
    waitForConnections: true,
    connectionLimit: config.DBConnsMaxOpen || 10,
    queueLimit: 0,
    enableKeepAlive: true,
  });

  pools[key] = pool;
  return pool;
}
