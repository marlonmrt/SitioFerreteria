const postgres = require('postgres');

async function main() {
  // Try Docker PostgreSQL with different IPs
  const hosts = ['127.0.0.1', 'localhost', '192.168.1.66'];
  
  for (const host of hosts) {
    try {
      const url = `postgresql://postgres:postgres@${host}:5432/mi_catalogo_db`;
      const sql = postgres(url, { max: 1 });
      const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
      const count = tables.length;
      console.log(`${host}: ${count} tables, names: ${tables.map(t => t.table_name).join(', ')}`);
      await sql.end();
    } catch (e) {
      console.log(`${host}: ERROR - ${e.message}`);
    }
  }

  // Try connecting to default 'postgres' database to list all databases
  try {
    const sql = postgres('postgresql://postgres:postgres@127.0.0.1:5432/postgres', { max: 1 });
    const dbs = await sql`SELECT datname FROM pg_database WHERE datistemplate=false ORDER BY datname`;
    console.log(`\nDatabases on 127.0.0.1: ${dbs.map(d => d.datname).join(', ')}`);
    await sql.end();
  } catch (e) {
    console.log(`Can't connect to postgres db: ${e.message}`);
  }
}

main().catch(console.error);
