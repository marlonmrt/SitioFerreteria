import { z } from "zod";

export const ImportRowSchema = z.object({
  erpCode: z.string().min(1, "El código ERP es obligatorio"),
  name: z.string().min(1, "El nombre del artículo es obligatorio"),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  unit: z.string().default("ud"),
  family: z.string().min(1, "La familia es obligatoria"),
  subfamily: z.string().min(1, "La subfamilia es obligatoria"),
  mainImage: z.string().optional().nullable(),
  prices: z.record(
    z.string(),
    z.coerce.number().nonnegative("El precio no puede ser negativo")
  )
});

export type ImportRow = z.infer<typeof ImportRowSchema>;
