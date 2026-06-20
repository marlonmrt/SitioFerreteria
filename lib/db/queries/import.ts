import { db } from "../index";
import { importBatches } from "../schema";
import { desc, eq } from "drizzle-orm";

export async function getImportBatches(limit = 50) {
  return db.query.importBatches.findMany({
    orderBy: [desc(importBatches.startedAt)],
    limit
  });
}

export async function getImportBatchById(id: string) {
  return db.query.importBatches.findFirst({
    where: eq(importBatches.id, id)
  });
}
