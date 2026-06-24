const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const NEON_URL = 'postgresql://neondb_owner:npg_Cw4qSL9ObEIj@ep-delicate-bread-abbge8lh-pooler.eu-west-2.aws.neon.tech/mi_catalogo_db?sslmode=require&channel_binding=require';
const DUMP_FILE = 'C:\\Users\\serve\\AppData\\Local\\Temp\\opencode\\local_dump_clean.sql';

const TABLES = [
  'public.favorites', 'public.info_requests', 'public.article_prices',
  'public.article_images', 'public.articles', 'public.subfamilies',
  'public.families', 'public.menu_items', 'public.users',
  'public.companies', 'public.import_batches', 'public.stores',
  'public.faqs', 'public.carousel_slides'
];

async function main() {
  console.log('Connecting to Neon...');
  const sql = postgres(NEON_URL, { max: 1 });

  try {
    // 1. Delete data in FK-safe order (children first, then parents)
    console.log('Deleting existing data...');
    await sql.unsafe('DELETE FROM public.favorites');
    await sql.unsafe('DELETE FROM public.info_requests');
    await sql.unsafe('DELETE FROM public.article_prices');
    await sql.unsafe('DELETE FROM public.article_images');
    await sql.unsafe('DELETE FROM public.articles');
    await sql.unsafe('DELETE FROM public.subfamilies');
    await sql.unsafe('DELETE FROM public.menu_items');
    await sql.unsafe('DELETE FROM public.users');
    await sql.unsafe('DELETE FROM public.companies');
    await sql.unsafe('DELETE FROM public.families');
    await sql.unsafe('DELETE FROM public.import_batches');
    await sql.unsafe('DELETE FROM public.stores');
    await sql.unsafe('DELETE FROM public.faqs');
    await sql.unsafe('DELETE FROM public.carousel_slides');
    console.log('✓ All data deleted');

    // 3. Read and execute dump
    console.log('Reading dump file...');
    const dumpSql = fs.readFileSync(DUMP_FILE, 'utf16le');

    console.log(`Executing ${(dumpSql.length/1024).toFixed(0)}KB of SQL...`);
    
    // Execute line by line
    const lines = dumpSql.split('\n');
    let currentStmt = '';
    let ok = 0, fail = 0;

    const skipLines = (l) => {
      const t = l.trim();
      return t.startsWith('--') || t.startsWith('\\restrict') || t.startsWith('SET SESSION AUTHORIZATION')
        || t.includes('DISABLE TRIGGER') || t.includes('ENABLE TRIGGER') || t === '';
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (skipLines(line)) continue;
      
      currentStmt += line + ' ';
      
      if (line.trim().endsWith(';')) {
        const stmt = currentStmt.trim();
        currentStmt = '';
        if (stmt.length > 1) {
          try {
            await sql.unsafe(stmt);
            ok++;
          } catch (e) {
            if (e.message.includes('already exists') || e.message.includes('duplicate key') || e.message.includes('unique constraint')) {
              ok++;
            } else {
              console.error(`  Error stmt ${ok+fail}: ${e.message.substring(0, 120)}`);
              fail++;
            }
          }
        }
        if ((ok+fail) % 50 === 0) process.stdout.write(`  ${ok} OK, ${fail} errors\r`);
      }
    }
    console.log(`\n✓ ${ok} statements, ${fail} errors`);

    // 4. Verify counts
    console.log('\n=== VERIFICATION ===');
    for (const t of TABLES) {
      const [row] = await sql.unsafe(`SELECT COUNT(*)::int AS cnt FROM ${t}`);
      console.log(`  ${t.padEnd(35)} ${row.cnt} rows`);
    }

  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await sql.end();
  }
}

main();
