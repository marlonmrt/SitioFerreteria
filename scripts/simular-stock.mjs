import postgres from 'postgres';

const sql = postgres('postgres://postgres:admin123@127.0.0.1:5432/mi_catalogo_db');

// Generar número aleatorio entre min y max
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOffer() {
  // 50% probabilidad de tener oferta; si tiene, entre 5% y 30%
  return Math.random() < 0.5 ? rand(5, 30) : 0;
}

(async () => {
  try {
    const articles = await sql`SELECT id, erp_code, name FROM articles ORDER BY name`;
    console.log(`Actualizando ${articles.length} artículos...\n`);

    let updated = 0;
    for (const article of articles) {
      const stock = rand(0, 50);
      const offerB2C = randomOffer();
      const offerB2B = randomOffer();

      await sql`
        UPDATE articles
        SET stock = ${stock},
            offer_b2c = ${offerB2C},
            offer_b2b = ${offerB2B}
        WHERE id = ${article.id}
      `;

      const ofertas = [];
      if (offerB2C > 0) ofertas.push(`B2C -${offerB2C}%`);
      if (offerB2B > 0) ofertas.push(`B2B -${offerB2B}%`);
      const ofertaStr = ofertas.length > 0 ? ` | Ofertas: ${ofertas.join(', ')}` : ' | Sin ofertas';

      console.log(`  [${String(++updated).padStart(3)}] ${article.name.padEnd(40)} Stock: ${String(stock).padStart(2)} uds${ofertaStr}`);
    }

    console.log(`\n✅ ${articles.length} artículos actualizados con stock y ofertas simulados.`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.end();
  }
})();
