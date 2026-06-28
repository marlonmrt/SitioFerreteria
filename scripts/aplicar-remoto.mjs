import postgres from 'postgres';

const REMOTE_URL = 'postgresql://neondb_owner:npg_Cw4qSL9ObEIj@ep-delicate-bread-abbge8lh-pooler.eu-west-2.aws.neon.tech/mi_catalogo_db?sslmode=require';

const sql = postgres(REMOTE_URL);

(async () => {
  try {
    // 1. Check current schema
    const cols = await sql`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'articles'
      ORDER BY ordinal_position
    `;
    console.log('Columnas actuales en remote:', cols.map(c => c.column_name).join(', '));

    const hasNewCols = cols.some(c => c.column_name === 'stock');
    const hasOldCols = cols.some(c => c.column_name === 'has_offer');

    if (hasNewCols) {
      console.log('✅ Columnas nuevas ya existen');
    } else {
      console.log('➕ Agregando columnas stock, offer_b2c, offer_b2b...');
      await sql`ALTER TABLE "articles" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL`;
      await sql`ALTER TABLE "articles" ADD COLUMN "offer_b2c" integer DEFAULT 0 NOT NULL`;
      await sql`ALTER TABLE "articles" ADD COLUMN "offer_b2b" integer DEFAULT 0 NOT NULL`;
      console.log('✅ Columnas agregadas');
    }

    if (hasOldCols) {
      console.log('➕ Migrando ofertas viejas a nuevas...');
      await sql`UPDATE "articles" SET "offer_b2c" = "offer_percentage" WHERE "has_offer" = true AND "offer_target" = 'B2C'`;
      await sql`UPDATE "articles" SET "offer_b2b" = "offer_percentage" WHERE "has_offer" = true AND "offer_target" = 'B2B'`;
      console.log('➕ Eliminando columnas viejas...');
      await sql`ALTER TABLE "articles" DROP COLUMN "has_offer"`;
      await sql`ALTER TABLE "articles" DROP COLUMN "offer_percentage"`;
      await sql`ALTER TABLE "articles" DROP COLUMN "offer_target"`;
      console.log('✅ Columnas viejas eliminadas');
    }

    // 3. Count articles
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM articles`;
    console.log(`📦 Artículos en remote: ${count}`);

    // 4. Read and apply the UPDATEs from the SQL file
    const fs = await import('fs/promises');
    const sqlContent = await fs.readFile('datos_migracion_bloque_8.sql', 'utf-8');

    // Extract only the UPDATE statements (section 4)
    const updateLines = sqlContent
      .split('\n')
      .filter(line => line.startsWith('UPDATE "articles"'))
      .join('\n');

    console.log('🔄 Aplicando stock y ofertas simulados...');
    await sql.unsafe(updateLines);
    console.log('✅ Datos actualizados');

    // 5. Verify
    const sample = await sql`
      SELECT erp_code, name, stock, offer_b2c, offer_b2b
      FROM articles
      ORDER BY name
      LIMIT 5
    `;
    console.log('\nVerificación (primeros 5):');
    for (const a of sample) {
      console.log(`  ${a.erp_code} | ${a.name} | Stock: ${a.stock} | B2C: ${a.offer_b2c}% | B2B: ${a.offer_b2b}%`);
    }

  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('Detail:', err.detail || '(none)');
  } finally {
    await sql.end();
  }
})();
