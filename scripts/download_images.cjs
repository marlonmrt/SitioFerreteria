const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.resolve(__dirname, '..', 'public', 'images', 'articles');

if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });

function downloadImage(url, outputPath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(outputPath);
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      // Follow redirects up to 3 times
      let redirects = 0;
      function handleResponse(response) {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 3) {
          redirects++;
          const loc = response.headers.location.startsWith('http')
            ? response.headers.location
            : new URL(response.headers.location, url).href;
          file.close();
          const p = url; // keep original url for reference
          const protocol2 = loc.startsWith('https') ? https : http;
          protocol2.get(loc, { timeout: 10000 }, handleResponse).on('error', () => { try { fs.unlinkSync(outputPath); } catch(e) {} resolve(false); });
          return;
        }
        const ct = response.headers['content-type'] || '';
        if (response.statusCode >= 200 && response.statusCode < 300 && ct.startsWith('image/')) {
          response.pipe(file);
          file.on('finish', () => { file.close(); const s = fs.statSync(outputPath).size; resolve(s > 500); });
          file.on('error', () => { file.close(); try { fs.unlinkSync(outputPath); } catch(e) {} resolve(false); });
        } else {
          file.close(); try { fs.unlinkSync(outputPath); } catch(e) {} resolve(false);
        }
      }
      handleResponse(res);
    });
    req.on('error', () => { file.close(); try { fs.unlinkSync(outputPath); } catch(e) {} resolve(false); });
    req.on('timeout', () => { req.destroy(); file.close(); try { fs.unlinkSync(outputPath); } catch(e) {} resolve(false); });
  });
}

// Search DuckDuckGo image API and download first result
function searchImagesDuckDuckGo(query) {
  return new Promise((resolve) => {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&iax=images&ia=images`;
    https.get(url, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // DuckDuckGo image results are in the "Results" or "ImageResults" field
          const results = json.Results || json.ImageResults || [];
          if (results.length > 0 && results[0].Image) {
            resolve(results[0].Image);
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// Search Google Custom Search (needs API key - fallback to Bing)
function searchBingImages(query) {
  return new Promise((resolve) => {
    // Use Bing.com search and extract first image from HTML
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&count=1`;
    https.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Extract first image URL from the HTML
        const match = data.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
        resolve(match ? match[1] : null);
      });
    }).on('error', () => resolve(null));
  });
}

// Try multiple image sources in order
async function findAndDownload(query, outputPath, label) {
  // Source 1: Bing image search
  const url = await searchBingImages(query);
  if (url) {
    const result = await downloadImage(url, outputPath);
    if (result) {
      const size = fs.statSync(outputPath).size;
      console.log(`  ✓ ${label} (Bing, ${(size/1024).toFixed(0)}KB)`);
      return true;
    }
  }
  console.log(`  ✗ ${label} (no image found)`);
  return false;
}

// ====== MAIN ======
async function main() {
  const articles = [
    { name: 'Amoladora angular 125mm 750W', slug: 'amoladora-angular-125mm', query: 'amoladora angular 125mm' },
    { name: 'Apilador manual hidráulico 1500kg', slug: 'apilador-manual-hidraulico-1500kg', query: 'apilador manual hidraulico 1500kg' },
    { name: 'Atornillador eléctrico 12V', slug: 'atornillador-electrico-12v', query: 'atornillador electrico 12v' },
    { name: 'Batidora de brazo industrial 550W', slug: 'batidora-brazo-industrial-550w', query: 'batidora brazo industrial 550w' },
    { name: 'Batidora de mano 700W', slug: 'batidora-mano-700w', query: 'batidora de mano 700w' },
    { name: 'Bombilla LED E27 9W', slug: 'bombilla-led-e27-9w', query: 'bombilla led e27 9w luz calida' },
    { name: 'Bombona de gas camping 450g', slug: 'bombona-gas-camping-450g', query: 'bombona gas camping 450g' },
    { name: 'Cable manguera 3x1.5mm 25m', slug: 'cable-manguera-3x1-5-25m', query: 'cable manguera electrico 3x1.5 25m' },
    { name: 'Cincel SDS-Plus puntero', slug: 'cincel-sds-plus-puntero', query: 'cincel sds plus puntero' },
    { name: 'Cinta americana multiuso 50mm', slug: 'cinta-americana-50mm', query: 'cinta americana multiuso 50mm' },
    { name: 'Columna de ducha termostática', slug: 'columna-ducha-termostatica', query: 'columna ducha termostatica' },
    { name: 'Cortacésped manual 38 cm', slug: 'cortacesped-manual-38cm', query: 'cortacesped manual 38cm' },
    { name: 'Cuadro eléctrico 12 módulos', slug: 'cuadro-electrico-12-modulos', query: 'cuadro electrico magnetotermicos 12 modulos' },
    { name: 'Electrodos rutilo 2.5mm 5kg', slug: 'electrodos-rutilo-2-5mm-5kg', query: 'electrodos rutilo 2.5mm caja 5kg' },
    { name: 'Enchufe base superficie', slug: 'enchufe-base-superficie', query: 'enchufe base superficie con toma tierra' },
    { name: 'Espejo de baño con luz LED', slug: 'espejo-bano-led', query: 'espejo bano con luz led' },
    { name: 'Exprimidor de naranja automático', slug: 'exprimidor-naranja-automatico-200w', query: 'exprimidor naranja automatico 200w' },
    { name: 'Foco LED exterior con sensor', slug: 'foco-led-exterior-sensor', query: 'foco led exterior con sensor' },
    { name: 'Gato hidráulico botella 20T', slug: 'gato-hidraulico-botella-20t', query: 'gato hidraulico botella 20 toneladas' },
    { name: 'Grifo de cocina extraíble', slug: 'grifo-cocina-extraible', query: 'grifo cocina extraible' },
    { name: 'Grifo monomando lavabo cromado', slug: 'grifo-monomando-lavabo-cromado', query: 'grifo monomando lavabo cromado' },
    { name: 'Hornillo camping piezoeléctrico', slug: 'hornillo-camping-piezoelectrico', query: 'hornillo camping piezoelectrico' },
    { name: 'Inodoro suspendido con cisterna', slug: 'inodoro-suspendido-cisterna', query: 'inodoro suspendido con cisterna' },
    { name: 'Interruptor de superficie con tapa', slug: 'interruptor-superficie-tapa', query: 'interruptor superficie con tapa' },
    { name: 'Juego llaves Allen 9 piezas', slug: 'juego-llaves-allen-9pz', query: 'juego llaves allen 9 piezas' },
    { name: 'Linterna frontal LED recargable', slug: 'linterna-frontal-led', query: 'linterna frontal led recargable' },
    { name: 'Linterna LED recargable camping', slug: 'linterna-led-recargable', query: 'linterna led recargable camping' },
    { name: 'Llave ajustable 10 pulgadas', slug: 'llave-ajustable-10-pulgadas', query: 'llave ajustable 10 pulgadas cromo vanadio' },
    { name: 'Manguera de riego 25m', slug: 'manguera-riego-25m', query: 'manguera riego 25m con racores' },
    { name: 'Manómetro digital neumáticos', slug: 'manometro-digital-neumaticos', query: 'manometro digital neumaticos' },
    { name: 'Máscara soldar autooscurecente', slug: 'mascara-soldar-autooscurecente', query: 'mascara soldar autooscurecente' },
    { name: 'Mesa de trabajo móvil ajustable', slug: 'mesa-trabajo-movil-ajustable', query: 'mesa trabajo movil ajustable' },
    { name: 'Mueble bajo lavabo 80 cm', slug: 'mueble-bajo-lavabo-80cm', query: 'mueble bajo lavabo 80cm' },
    { name: 'Pala de punta acero forjado', slug: 'pala-punta-acero-forjado', query: 'pala punta acero forjado' },
    { name: 'Panel LED techo 60x60 cm', slug: 'panel-led-techo-60x60', query: 'panel led techo 60x60 cm' },
    { name: 'Pistola de inflado digital', slug: 'pistola-inflado-digital', query: 'pistola inflado digital' },
    { name: 'Prensa hidráulica taller 40T', slug: 'prensa-hidraulica-taller-40t', query: 'prensa hidraulica taller 40 toneladas' },
    { name: 'Programador de riego digital', slug: 'programador-riego-digital', query: 'programador riego digital' },
    { name: 'Rastrillo de jardín 14 púas', slug: 'rastrillo-jardin-14-puas', query: 'rastrillo jardin 14 puas' },
    { name: 'Set de cuchillos cocina 6 pz', slug: 'set-cuchillos-cocina-6pz', query: 'set cuchillos cocina 6 piezas' },
    { name: 'Set mesa y 4 sillas jardín', slug: 'set-mesa-4-sillas-jardin', query: 'set mesa 4 sillas jardin' },
    { name: 'Silla plegable camping reforzada', slug: 'silla-plegable-camping', query: 'silla plegable camping reforzada' },
    { name: 'Soldador inverter MMA 160A', slug: 'soldador-inverter-mma-160a', query: 'soldador inverter mma 160a' },
    { name: 'Surtido tornillería 1000 pz', slug: 'surtido-tornilleria-1000pz', query: 'surtido tornilleria 1000 piezas' },
    { name: 'Tabla de corte de bambú', slug: 'tabla-corte-bambu', query: 'tabla corte bambu cocina' },
    { name: 'Taladro percutor 18V', slug: 'taladro-percutor-18v', query: 'taladro percutor 18v con bateria' },
    { name: 'Tijera de podar profesional', slug: 'tijera-podar-profesional', query: 'tijera podar profesional' },
    { name: 'Toallero radiador eléctrico', slug: 'toallero-radiador-electrico', query: 'toallero radiador electrico' },
    { name: 'Tostadora doble ranura inox', slug: 'tostadora-doble-ranura', query: 'tostadora doble ranura inoxidable' },
    // Seed articles that need images (never existed on disk)
    { name: 'Adhesivo montaje extra fuerte', slug: 'adhesivo-montaje', query: 'adhesivo montaje extra fuerte' },
    { name: 'Anclaje químico 300 ml', slug: 'anclaje-quimico', query: 'anclaje quimico 300ml' },
    { name: 'Aspiradora ciclónica compacta', slug: 'aspiradora-ciclonica', query: 'aspiradora ciclonica compacta' },
    { name: 'Caja organizadora apilable', slug: 'caja-organizadora', query: 'caja organizadora apilable plastico' },
    { name: 'Silicona neutra blanca', slug: 'silicona-neutra', query: 'silicona neutra blanca sellado' },
    { name: 'Taco nylon con tornillo 8mm', slug: 'taco-tornillo', query: 'taco nylon con tornillo 8mm fijacion' },
  ];

  let ok = 0, fail = 0, skip = 0;
  for (const article of articles) {
    const filePath = path.join(ARTICLES_DIR, `${article.slug}.jpg`);
    // Skip if file exists and >50KB
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 50000) {
      console.log(`  SKIP ${article.slug}.jpg`);
      skip++;
      continue;
    }
    const result = await findAndDownload(article.query, filePath, article.slug);
    if (result) ok++; else fail++;
    await new Promise(r => setTimeout(r, 1500)); // delay between searches
  }

  console.log(`\nResults: ${ok} OK, ${fail} failed, ${skip} skipped`);
}

main().catch(console.error);
