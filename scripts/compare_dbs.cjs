const postgres = require('postgres');

const NEON_URL = 'postgresql://neondb_owner:npg_Cw4qSL9ObEIj@ep-delicate-bread-abbge8lh-pooler.eu-west-2.aws.neon.tech/mi_catalogo_db?sslmode=require&channel_binding=require';
const LOCAL_URL = 'postgresql://postgres:admin123@127.0.0.1:5432/mi_catalogo_db';

async function query(sql, q) {
  try { return await sql.unsafe(q); } catch (e) { return []; }
}

async function compare() {
  const neon = postgres(NEON_URL, { max: 1 });
  const local = postgres(LOCAL_URL, { max: 1 });

  try {
    // ---- TABLES ----
    const neonTables = (await query(neon, "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")).map(r => r.table_name);
    const localTables = (await query(local, "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")).map(r => r.table_name);

    console.log('=== TABLAS ===');
    console.log('En Neon:', neonTables.length);
    console.log('En Local:', localTables.length);
    const missingInNeon = localTables.filter(t => !neonTables.includes(t));
    const missingInLocal = neonTables.filter(t => !localTables.includes(t));
    if (missingInNeon.length) console.log('Faltan en Neon:', missingInNeon.join(', '));
    if (missingInLocal.length) console.log('Sobran en Neon:', missingInLocal.join(', '));
    if (!missingInNeon.length && !missingInLocal.length) console.log('✓ Coinciden');

    // ---- ROW COUNTS ----
    console.log('\n=== CONTEO DE FILAS ===');
    const allTables = [...new Set([...neonTables, ...localTables])].sort();
    for (const t of allTables) {
      const n = await query(neon, `SELECT COUNT(*)::int AS cnt FROM public.${t}`);
      const l = await query(local, `SELECT COUNT(*)::int AS cnt FROM public.${t}`);
      const nCnt = n[0]?.cnt ?? 0;
      const lCnt = l[0]?.cnt ?? 0;
      const marker = nCnt !== lCnt ? ' ← DIFERENTE' : '';
      console.log(`  ${t.padEnd(30)} Neon: ${String(nCnt).padStart(4)}  Local: ${String(lCnt).padStart(4)}${marker}`);
    }

    // ---- DEEP COMPARE for key tables ----
    const keyTables = ['articles', 'families', 'subfamilies', 'carousel_slides', 'menu_items', 'stores', 'faqs'];
    console.log('\n=== COMPARACIÓN DETALLADA ===');
    for (const t of keyTables) {
      if (!neonTables.includes(t) || !localTables.includes(t)) continue;
      const nRows = await query(neon, `SELECT * FROM public.${t} ORDER BY id`);
      const lRows = await query(local, `SELECT * FROM public.${t} ORDER BY id`);
      const nIds = new Set(nRows.map(r => r.id));
      const lIds = new Set(lRows.map(r => r.id));
      const onlyNeon = nRows.filter(r => !lIds.has(r.id));
      const onlyLocal = lRows.filter(r => !nIds.has(r.id));
      if (onlyNeon.length || onlyLocal.length) {
        console.log(`\n  ${t}:`);
        if (onlyNeon.length) console.log(`    Solo en Neon (${onlyNeon.length}): ${onlyNeon.map(r => r.name || r.title || r.label || r.id).join(', ')}`);
        if (onlyLocal.length) console.log(`    Solo en Local (${onlyLocal.length}): ${onlyLocal.map(r => r.name || r.title || r.label || r.id).join(', ')}`);
      } else {
        console.log(`  ${t}: ✓ iguales (${nRows.length} registros)`);
      }
    }

    // ---- MIGRATIONS ----
    console.log('\n=== MIGRACIONES ===');
    const nMigs = await query(neon, "SELECT id, hash FROM drizzle.__drizzle_migrations ORDER BY id");
    const lMigs = await query(local, "SELECT id, hash FROM drizzle.__drizzle_migrations ORDER BY id");
    console.log('Neon:', JSON.stringify(nMigs));
    console.log('Local:', JSON.stringify(lMigs));

  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await neon.end();
    await local.end();
  }
}

compare();
