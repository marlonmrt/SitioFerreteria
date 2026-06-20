"use server";

import { getImportBatches, getImportBatchById } from "@/lib/db/queries";

export async function refreshBatchesAction() {
  return getImportBatches();
}

export async function checkBatchStatusAction(batchId: string) {
  return getImportBatchById(batchId);
}
