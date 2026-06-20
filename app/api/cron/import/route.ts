import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { parseCsv } from "@/lib/import/parser";
import { syncImport } from "@/lib/import/sync";
import { DEFAULT_MAPPING } from "@/lib/import/mapping";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "change-me";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), "fixtures", "erp-export-sample.csv");

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: "No se encontró el fichero de exportación del ERP en fixtures/" },
        { status: 404 }
      );
    }

    const buffer = await fs.readFile(filePath);
    const parseResult = parseCsv(buffer, DEFAULT_MAPPING);

    if (parseResult.rows.length === 0) {
      return NextResponse.json(
        { error: "El fichero del ERP está vacío o no es válido" },
        { status: 400 }
      );
    }

    const batchId = crypto.randomUUID();

    // Lanzar el proceso de sincronización en segundo plano (sin await)
    syncImport(parseResult.rows, "erp-export-sample.csv", "CSV", batchId).catch(
      (err) => {
        console.error(
          `Error en importación automática (Cron) para lote ${batchId}:`,
          err
        );
      }
    );

    return NextResponse.json({
      message: "Sincronización programada iniciada en segundo plano",
      batchId,
      totalRows: parseResult.rows.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";
    console.error("Error en API de cron de importación:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
