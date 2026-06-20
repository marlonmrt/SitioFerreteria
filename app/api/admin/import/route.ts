import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/auth";
import { parseCsv, parseExcel } from "@/lib/import/parser";
import { syncImport } from "@/lib/import/sync";
import { DEFAULT_MAPPING } from "@/lib/import/mapping";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { type?: string }).type !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado. Se requiere rol de administrador." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "CSV" | "XLSX"

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo en el formulario" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = type === "XLSX" || file.name.endsWith(".xlsx") ? "XLSX" : "CSV";

    let parseResult;
    if (fileType === "XLSX") {
      parseResult = await parseExcel(buffer, DEFAULT_MAPPING);
    } else {
      parseResult = parseCsv(buffer, DEFAULT_MAPPING);
    }

    if (parseResult.rows.length === 0 && parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: "El archivo no contiene filas con datos válidos",
          details: parseResult.errors
        },
        { status: 400 }
      );
    }

    const batchId = crypto.randomUUID();

    // Ejecutar el proceso en segundo plano para evitar timeout HTTP
    syncImport(parseResult.rows, file.name, fileType, batchId).catch((err) => {
      console.error(`Error en importación en background para lote ${batchId}:`, err);
    });

    return NextResponse.json({
      message: "Proceso de sincronización iniciado en segundo plano",
      batchId,
      totalRows: parseResult.rows.length,
      warnings: parseResult.errors
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";
    console.error("Error en API de importación administrativa:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
