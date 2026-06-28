import postgres from 'postgres';
import fs from 'fs/promises';

const sql = postgres('postgres://postgres:admin123@127.0.0.1:5432/mi_catalogo_db');

(async () => {
  try {
    const articles = await sql`
      SELECT id, erp_code, name, stock, offer_b2c, offer_b2b
      FROM articles
      ORDER BY erp_code
    `;

    let sqlContent = `-- ============================================================
-- BLOQUE 8: Stock, Ofertas B2C y B2B
-- Generado: ${new Date().toISOString()}
-- ============================================================

-- 1. Agregar columnas (seguro si ya existen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'stock'
  ) THEN
    ALTER TABLE "articles" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'offer_b2c'
  ) THEN
    ALTER TABLE "articles" ADD COLUMN "offer_b2c" integer DEFAULT 0 NOT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'offer_b2b'
  ) THEN
    ALTER TABLE "articles" ADD COLUMN "offer_b2b" integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 2. Migrar ofertas existentes (si las columnas viejas existen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'has_offer'
  ) THEN
    UPDATE "articles" SET "offer_b2c" = "offer_percentage" WHERE "has_offer" = true AND "offer_target" = 'B2C';
    UPDATE "articles" SET "offer_b2b" = "offer_percentage" WHERE "has_offer" = true AND "offer_target" = 'B2B';
  END IF;
END $$;

-- 3. Eliminar columnas viejas (si existen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'has_offer'
  ) THEN
    ALTER TABLE "articles" DROP COLUMN "has_offer";
    ALTER TABLE "articles" DROP COLUMN "offer_percentage";
    ALTER TABLE "articles" DROP COLUMN "offer_target";
  END IF;
END $$;

-- 4. Actualizar stock y ofertas simulados
-- Basado en datos generados el ${new Date().toISOString().split('T')[0]}
`;

    for (const a of articles) {
      sqlContent += `UPDATE "articles" SET "stock" = ${a.stock}, "offer_b2c" = ${a.offer_b2c}, "offer_b2b" = ${a.offer_b2b} WHERE "id" = '${a.id}';\n`;
    }

    sqlContent += `\n-- Total artículos actualizados: ${articles.length}\n`;

    // Write the SQL file
    await fs.writeFile('datos_migracion_bloque_8.sql', sqlContent, 'utf-8');
    console.log(`✅ SQL generado: datos_migracion_bloque_8.sql (${articles.length} artículos)`);

    // Also export individual UPDATEs by erp_code for readability
    let readableSql = `-- ============================================================
-- BLOQUE 8: Stock y Ofertas - Versión legible por ERP Code
-- ============================================================\n\n`;
    for (const a of articles) {
      const offers = [];
      if (a.offer_b2c > 0) offers.push(`B2C -${a.offer_b2c}%`);
      if (a.offer_b2b > 0) offers.push(`B2B -${a.offer_b2b}%`);
      const offerStr = offers.length > 0 ? offers.join(', ') : 'Sin ofertas';
      readableSql += `-- ${a.erp_code.padEnd(15)} ${a.name.padEnd(45)} Stock: ${String(a.stock).padStart(2)} | ${offerStr}\n`;
    }
    readableSql += `\n-- Total: ${articles.length} artículos\n`;

    await fs.writeFile('datos_migracion_bloque_8_legible.sql', readableSql, 'utf-8');
    console.log(`✅ SQL legible generado: datos_migracion_bloque_8_legible.sql`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.end();
  }
})();
