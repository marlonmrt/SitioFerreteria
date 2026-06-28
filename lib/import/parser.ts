import Papa from "papaparse";
import ExcelJS from "exceljs";
import { ImportRowSchema, type ImportRow } from "../validators/import";
import type { ColumnMapping } from "./mapping";

export interface ParseResult {
  rows: ImportRow[];
  errors: { row: number; reason: string }[];
}

export function parseCsv(buffer: Uint8Array, mapping: ColumnMapping): ParseResult {
  const csvString = new TextDecoder("utf-8").decode(buffer);
  const result = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: "greedy"
  });

  const rows: ImportRow[] = [];
  const errors: { row: number; reason: string }[] = [];

  result.data.forEach((row, index) => {
    try {
      const erpCode = row[mapping.erpCode]?.trim();
      const name = row[mapping.name]?.trim();
      const description = row[mapping.description]?.trim() || null;
      const brand = row[mapping.brand]?.trim() || null;
      const unit = row[mapping.unit]?.trim() || "ud";
      const family = row[mapping.family]?.trim();
      const subfamily = row[mapping.subfamily]?.trim();
      const mainImage = row[mapping.mainImage]?.trim() || null;
      const stock = row[mapping.stock]?.trim() || "0";
      const offerB2C = row[mapping.offerB2C]?.trim() || "0";
      const offerB2B = row[mapping.offerB2B]?.trim() || "0";

      const prices: Record<string, number> = {};
      Object.entries(mapping.prices).forEach(([priceListCode, columnName]) => {
        const priceStr = row[columnName];
        if (priceStr !== undefined && priceStr !== "") {
          const parsedPrice = parseFloat(priceStr.replace(",", "."));
          if (!isNaN(parsedPrice)) {
            prices[priceListCode] = parsedPrice;
          }
        }
      });

      const normalized = {
        erpCode,
        name,
        description,
        brand,
        unit,
        family,
        subfamily,
        mainImage,
        stock,
        offerB2C,
        offerB2B,
        prices
      };

      const parsed = ImportRowSchema.safeParse(normalized);
      if (parsed.success) {
        rows.push(parsed.data);
      } else {
        errors.push({
          row: index + 2, // 1-indexed y considerando cabecera
          reason: parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(", ")
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error inesperado al normalizar fila";
      errors.push({
        row: index + 2,
        reason: msg
      });
    }
  });

  return { rows, errors };
}

export async function parseExcel(
  buffer: Uint8Array,
  mapping: ColumnMapping
): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return { rows: [], errors: [{ row: 0, reason: "El archivo Excel no tiene hojas" }] };
  }

  const rows: ImportRow[] = [];
  const errors: { row: number; reason: string }[] = [];

  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = cell.text?.trim() || "";
  });

  const getCellValue = (cell: ExcelJS.Cell): string => {
    if (cell.value === null || cell.value === undefined) return "";
    if (typeof cell.value === "object") {
      if ("richText" in cell.value) {
        return cell.value.richText.map((t) => t.text).join("");
      }
      if ("result" in cell.value) {
        return String(cell.value.result ?? "");
      }
      if ("text" in cell.value) {
        return String(cell.value.text ?? "");
      }
    }
    return String(cell.value);
  };

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // saltar cabecera

    try {
      const rowData: Record<string, string> = {};
      // Llenar todas las columnas mapeando por el encabezado correspondiente
      headers.forEach((header, colIndex) => {
        if (header) {
          const cell = row.getCell(colIndex);
          rowData[header] = getCellValue(cell).trim();
        }
      });

      const erpCode = rowData[mapping.erpCode];
      const name = rowData[mapping.name];
      const description = rowData[mapping.description] || null;
      const brand = rowData[mapping.brand] || null;
      const unit = rowData[mapping.unit] || "ud";
      const family = rowData[mapping.family];
      const subfamily = rowData[mapping.subfamily];
      const mainImage = rowData[mapping.mainImage] || null;
      const stock = rowData[mapping.stock] || "0";
      const offerB2C = rowData[mapping.offerB2C] || "0";
      const offerB2B = rowData[mapping.offerB2B] || "0";

      const prices: Record<string, number> = {};
      Object.entries(mapping.prices).forEach(([priceListCode, columnName]) => {
        const priceStr = rowData[columnName];
        if (priceStr !== undefined && priceStr !== "") {
          const parsedPrice = parseFloat(priceStr.replace(",", "."));
          if (!isNaN(parsedPrice)) {
            prices[priceListCode] = parsedPrice;
          }
        }
      });

      const normalized = {
        erpCode,
        name,
        description,
        brand,
        unit,
        family,
        subfamily,
        mainImage,
        stock,
        offerB2C,
        offerB2B,
        prices
      };

      const parsed = ImportRowSchema.safeParse(normalized);
      if (parsed.success) {
        rows.push(parsed.data);
      } else {
        errors.push({
          row: rowNumber,
          reason: parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(", ")
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error inesperado al normalizar fila Excel";
      errors.push({
        row: rowNumber,
        reason: msg
      });
    }
  });

  return { rows, errors };
}
