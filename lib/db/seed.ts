import { randomUUID } from "node:crypto";

import { db } from "./index";
import {
  articleImages,
  articlePrices,
  articles,
  companies,
  faqs,
  families,
  favorites,
  importBatches,
  infoRequests,
  stores,
  subfamilies,
  users
} from "./schema";

type SeedEntity = {
  id: string;
};

type FamilySeed = SeedEntity & {
  name: string;
  slug: string;
  image: string;
  sortOrder: number;
};

type SubfamilySeed = SeedEntity & {
  familyKey: string;
  name: string;
  slug: string;
  sortOrder: number;
};

type ArticleSeed = SeedEntity & {
  subfamilyKey: string;
  erpCode: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  unit: string;
  mainImage: string;
  publicPrice: string;
  b2bPrice: string;
};

const familySeeds: FamilySeed[] = [
  { id: randomUUID(), name: "Baños", slug: "banos", image: "/images/families/banos.jpg", sortOrder: 1 },
  {
    id: randomUUID(),
    name: "Cerámicas",
    slug: "ceramicas",
    image: "/images/families/ceramicas.jpg",
    sortOrder: 2
  },
  {
    id: randomUUID(),
    name: "Climatización",
    slug: "climatizacion",
    image: "/images/families/climatizacion.jpg",
    sortOrder: 3
  },
  {
    id: randomUUID(),
    name: "Construcción",
    slug: "construccion",
    image: "/images/families/construccion.jpg",
    sortOrder: 4
  },
  {
    id: randomUUID(),
    name: "Hogar y Electrodomésticos",
    slug: "hogar-electrodomesticos",
    image: "/images/families/hogar-electrodomesticos.jpg",
    sortOrder: 5
  },
  {
    id: randomUUID(),
    name: "Sellado y Fijación",
    slug: "sellado-fijacion",
    image: "/images/families/sellado-fijacion.jpg",
    sortOrder: 6
  }
];

const subfamilySeeds: SubfamilySeed[] = [
  { id: randomUUID(), familyKey: "banos", name: "Grifería", slug: "banos-griferia", sortOrder: 1 },
  { id: randomUUID(), familyKey: "banos", name: "Mobiliario", slug: "banos-mobiliario", sortOrder: 2 },
  { id: randomUUID(), familyKey: "banos", name: "Sanitarios", slug: "banos-sanitarios", sortOrder: 3 },
  { id: randomUUID(), familyKey: "ceramicas", name: "Revestimientos", slug: "ceramicas-revestimientos", sortOrder: 1 },
  { id: randomUUID(), familyKey: "ceramicas", name: "Pavimentos", slug: "ceramicas-pavimentos", sortOrder: 2 },
  { id: randomUUID(), familyKey: "ceramicas", name: "Adhesivos", slug: "ceramicas-adhesivos", sortOrder: 3 },
  { id: randomUUID(), familyKey: "climatizacion", name: "Aire acondicionado", slug: "climatizacion-aire-acondicionado", sortOrder: 1 },
  { id: randomUUID(), familyKey: "climatizacion", name: "Ventilación", slug: "climatizacion-ventilacion", sortOrder: 2 },
  { id: randomUUID(), familyKey: "climatizacion", name: "Calefacción", slug: "climatizacion-calefaccion", sortOrder: 3 },
  { id: randomUUID(), familyKey: "construccion", name: "Morteros", slug: "construccion-morteros", sortOrder: 1 },
  { id: randomUUID(), familyKey: "construccion", name: "Cementos", slug: "construccion-cementos", sortOrder: 2 },
  { id: randomUUID(), familyKey: "construccion", name: "Herramienta de obra", slug: "construccion-herramienta-obra", sortOrder: 3 },
  { id: randomUUID(), familyKey: "hogar-electrodomesticos", name: "Cocina", slug: "hogar-cocina", sortOrder: 1 },
  { id: randomUUID(), familyKey: "hogar-electrodomesticos", name: "Limpieza", slug: "hogar-limpieza", sortOrder: 2 },
  { id: randomUUID(), familyKey: "hogar-electrodomesticos", name: "Almacenaje", slug: "hogar-almacenaje", sortOrder: 3 },
  { id: randomUUID(), familyKey: "sellado-fijacion", name: "Siliconas", slug: "sellado-siliconas", sortOrder: 1 },
  { id: randomUUID(), familyKey: "sellado-fijacion", name: "Adhesivos", slug: "sellado-adhesivos", sortOrder: 2 },
  { id: randomUUID(), familyKey: "sellado-fijacion", name: "Fijaciones", slug: "sellado-fijaciones", sortOrder: 3 }
];

const articleSeeds: ArticleSeed[] = [
  {
    id: randomUUID(),
    subfamilyKey: "banos-griferia",
    erpCode: "BAN-GRI-001",
    name: "Grifo monomando lavabo cromo",
    slug: "grifo-monomando-lavabo-cromo",
    description: "Grifo monomando con cartucho cerámico y acabado cromado.",
    brand: "AquaPro",
    unit: "ud",
    mainImage: "/images/articles/grifo-lavabo.jpg",
    publicPrice: "49.90",
    b2bPrice: "41.50"
  },
  {
    id: randomUUID(),
    subfamilyKey: "banos-griferia",
    erpCode: "BAN-GRI-002",
    name: "Columna de ducha termostática",
    slug: "columna-ducha-termostatica",
    description: "Columna con rociador superior y barra regulable.",
    brand: "AquaPro",
    unit: "ud",
    mainImage: "/images/articles/columna-ducha.jpg",
    publicPrice: "189.00",
    b2bPrice: "159.00"
  },
  {
    id: randomUUID(),
    subfamilyKey: "banos-mobiliario",
    erpCode: "BAN-MOB-001",
    name: "Mueble bajo lavabo 80 cm",
    slug: "mueble-bajo-lavabo-80",
    description: "Mueble suspendido con cierre suave y dos cajones.",
    brand: "NordBath",
    unit: "ud",
    mainImage: "/images/articles/mueble-lavabo.jpg",
    publicPrice: "239.00",
    b2bPrice: "199.00"
  },
  {
    id: randomUUID(),
    subfamilyKey: "banos-sanitarios",
    erpCode: "BAN-SAN-001",
    name: "Inodoro compacto rimless",
    slug: "inodoro-compacto-rimless",
    description: "Sanitario de doble descarga y tanque bajo.",
    brand: "NordBath",
    unit: "ud",
    mainImage: "/images/articles/inodoro.jpg",
    publicPrice: "219.00",
    b2bPrice: "182.00"
  },
  {
    id: randomUUID(),
    subfamilyKey: "ceramicas-revestimientos",
    erpCode: "CER-REV-001",
    name: "Azulejo efecto piedra 30x60",
    slug: "azulejo-efecto-piedra-30x60",
    description: "Revestimiento porcelánico apto para interior y exterior.",
    brand: "StoneLine",
    unit: "m2",
    mainImage: "/images/articles/azulejo-piedra.jpg",
    publicPrice: "24.90",
    b2bPrice: "20.75"
  },
  {
    id: randomUUID(),
    subfamilyKey: "ceramicas-pavimentos",
    erpCode: "CER-PAV-001",
    name: "Pavimento porcelánico madera",
    slug: "pavimento-porcelanico-madera",
    description: "Acabado madera natural con alta resistencia al desgaste.",
    brand: "StoneLine",
    unit: "m2",
    mainImage: "/images/articles/pavimento-madera.jpg",
    publicPrice: "28.50",
    b2bPrice: "23.80"
  },
  {
    id: randomUUID(),
    subfamilyKey: "ceramicas-adhesivos",
    erpCode: "CER-ADH-001",
    name: "Adhesivo cementoso flexible C2TE",
    slug: "adhesivo-cementoso-flexible-c2te",
    description: "Mortero cola flexible para cerámica de grandes formatos.",
    brand: "FixTile",
    unit: "saco",
    mainImage: "/images/articles/adhesivo-cementoso.jpg",
    publicPrice: "11.90",
    b2bPrice: "9.80"
  },
  {
    id: randomUUID(),
    subfamilyKey: "climatizacion-aire-acondicionado",
    erpCode: "CLI-AC-001",
    name: "Split inverter 2.5 kW",
    slug: "split-inverter-2-5kw",
    description: "Equipo eficiente con modo silencioso y control remoto.",
    brand: "CoolTech",
    unit: "ud",
    mainImage: "/images/articles/split-inverter.jpg",
    publicPrice: "499.00",
    b2bPrice: "429.00"
  },
  {
    id: randomUUID(),
    subfamilyKey: "climatizacion-ventilacion",
    erpCode: "CLI-VEN-001",
    name: "Extractor de baño silencioso",
    slug: "extractor-bano-silencioso",
    description: "Extractor con bajo nivel sonoro y válvula antirretorno.",
    brand: "AirFlow",
    unit: "ud",
    mainImage: "/images/articles/extractor-bano.jpg",
    publicPrice: "39.90",
    b2bPrice: "32.50"
  },
  {
    id: randomUUID(),
    subfamilyKey: "climatizacion-calefaccion",
    erpCode: "CLI-CAL-001",
    name: "Radiador de aceite 9 elementos",
    slug: "radiador-aceite-9-elementos",
    description: "Radiador portátil con termostato regulable.",
    brand: "WarmHome",
    unit: "ud",
    mainImage: "/images/articles/radiador-aceite.jpg",
    publicPrice: "79.00",
    b2bPrice: "67.00"
  },
  {
    id: randomUUID(),
    subfamilyKey: "construccion-morteros",
    erpCode: "CON-MOR-001",
    name: "Mortero de reparación rápida",
    slug: "mortero-reparacion-rapida",
    description: "Mortero para pequeñas reparaciones y anclajes rápidos.",
    brand: "BuildFix",
    unit: "saco",
    mainImage: "/images/articles/mortero-rapido.jpg",
    publicPrice: "7.95",
    b2bPrice: "6.50"
  },
  {
    id: randomUUID(),
    subfamilyKey: "construccion-cementos",
    erpCode: "CON-CEM-001",
    name: "Cemento portland 25 kg",
    slug: "cemento-portland-25kg",
    description: "Cemento para obra general y hormigón de uso habitual.",
    brand: "BuildFix",
    unit: "saco",
    mainImage: "/images/articles/cemento-portland.jpg",
    publicPrice: "5.40",
    b2bPrice: "4.60"
  },
  {
    id: randomUUID(),
    subfamilyKey: "construccion-herramienta-obra",
    erpCode: "CON-HER-001",
    name: "Llana de acero inoxidable",
    slug: "llana-acero-inoxidable",
    description: "Llana profesional con mango ergonómico de goma.",
    brand: "ProBuild",
    unit: "ud",
    mainImage: "/images/articles/llana-acero.jpg",
    publicPrice: "16.90",
    b2bPrice: "13.90"
  },
  {
    id: randomUUID(),
    subfamilyKey: "hogar-cocina",
    erpCode: "HOG-COC-001",
    name: "Batidora de mano 700W",
    slug: "batidora-mano-700w",
    description: "Batidora compacta con velocidad variable y vaso medidor.",
    brand: "HomeLab",
    unit: "ud",
    mainImage: "/images/articles/batidora-mano.jpg",
    publicPrice: "29.90",
    b2bPrice: "24.90"
  },
  {
    id: randomUUID(),
    subfamilyKey: "hogar-limpieza",
    erpCode: "HOG-LIM-001",
    name: "Aspiradora ciclónica compacta",
    slug: "aspiradora-ciclonica-compacta",
    description: "Aspiradora sin bolsa con filtro lavable.",
    brand: "HomeLab",
    unit: "ud",
    mainImage: "/images/articles/aspiradora-ciclonica.jpg",
    publicPrice: "89.00",
    b2bPrice: "74.00"
  },
  {
    id: randomUUID(),
    subfamilyKey: "hogar-almacenaje",
    erpCode: "HOG-ALM-001",
    name: "Caja organizadora apilable",
    slug: "caja-organizadora-apilable",
    description: "Caja transparente con tapa y sistema de apilado.",
    brand: "StoreMax",
    unit: "ud",
    mainImage: "/images/articles/caja-organizadora.jpg",
    publicPrice: "8.90",
    b2bPrice: "7.20"
  },
  {
    id: randomUUID(),
    subfamilyKey: "sellado-siliconas",
    erpCode: "SEL-SIL-001",
    name: "Silicona neutra blanca",
    slug: "silicona-neutra-blanca",
    description: "Sellador multiuso para baños, cocinas y carpintería.",
    brand: "SealPro",
    unit: "cartucho",
    mainImage: "/images/articles/silicona-neutra.jpg",
    publicPrice: "4.80",
    b2bPrice: "3.90"
  },
  {
    id: randomUUID(),
    subfamilyKey: "sellado-adhesivos",
    erpCode: "SEL-ADH-001",
    name: "Adhesivo montaje extra fuerte",
    slug: "adhesivo-montaje-extra-fuerte",
    description: "Adhesivo de montaje para interiores y acabados rápidos.",
    brand: "SealPro",
    unit: "cartucho",
    mainImage: "/images/articles/adhesivo-montaje.jpg",
    publicPrice: "6.50",
    b2bPrice: "5.40"
  },
  {
    id: randomUUID(),
    subfamilyKey: "sellado-fijaciones",
    erpCode: "SEL-FIJ-001",
    name: "Taco nylon con tornillo 8 mm",
    slug: "taco-nylon-con-tornillo-8mm",
    description: "Kit de fijación para pared con alta resistencia.",
    brand: "FastFix",
    unit: "pack",
    mainImage: "/images/articles/taco-tornillo.jpg",
    publicPrice: "9.40",
    b2bPrice: "7.70"
  },
  {
    id: randomUUID(),
    subfamilyKey: "sellado-fijaciones",
    erpCode: "SEL-FIJ-002",
    name: "Anclaje químico 300 ml",
    slug: "anclaje-quimico-300ml",
    description: "Anclaje químico para cargas medias y altas.",
    brand: "FastFix",
    unit: "cartucho",
    mainImage: "/images/articles/anclaje-quimico.jpg",
    publicPrice: "14.90",
    b2bPrice: "12.10"
  }
];

const storeSeeds = [
  {
    id: randomUUID(),
    name: "Tienda Central",
    address: "C/ Principal 123, Santa Cruz de Tenerife",
    phone: "+34 922 000 000",
    openingHours: "L-V 08:00-19:00 | S 09:00-13:00",
    lat: 28.4636,
    lng: -16.2518
  },
  {
    id: randomUUID(),
    name: "Sucursal Sur",
    address: "Av. Comercio 45, Adeje",
    phone: "+34 922 111 111",
    openingHours: "L-V 08:30-18:30 | S 09:00-13:00",
    lat: 28.1227,
    lng: -16.7245
  }
];

const faqSeeds = [
  {
    id: randomUUID(),
    question: "¿Puedo comprar online desde esta web?",
    answer:
      "No. Este portal es informativo y está orientado a consulta de catálogo, disponibilidad y solicitud de presupuesto.",
    sortOrder: 1
  },
  {
    id: randomUUID(),
    question: "¿Cómo accedo a tarifas B2B?",
    answer:
      "La empresa debe registrarse y esperar validación manual. Una vez aprobada, verá su tarifa asignada al iniciar sesión.",
    sortOrder: 2
  },
  {
    id: randomUUID(),
    question: "¿Qué pasa si el ERP cambia precios o artículos?",
    answer:
      "El módulo de importación sincroniza el catálogo local con el fichero exportado por el ERP, actualizando precios y estado.",
    sortOrder: 3
  },
  {
    id: randomUUID(),
    question: "¿Puedo guardar favoritos?",
    answer:
      "Sí, los usuarios con sesión B2C o B2B pueden guardar artículos para volver a consultarlos más tarde.",
    sortOrder: 4
  },
  {
    id: randomUUID(),
    question: "¿La disponibilidad mostrada es stock real?",
    answer:
      "No. La disponibilidad es orientativa. Siempre recomendamos confirmar en tienda antes de desplazarse.",
    sortOrder: 5
  }
];

async function resetSeedTables() {
  await db.transaction(async (tx) => {
    await tx.delete(favorites);
    await tx.delete(infoRequests);
    await tx.delete(articlePrices);
    await tx.delete(articleImages);
    await tx.delete(articles);
    await tx.delete(subfamilies);
    await tx.delete(families);
    await tx.delete(stores);
    await tx.delete(companies);
    await tx.delete(users);
    await tx.delete(importBatches);
    await tx.delete(faqs);
  });
}

async function main() {
  await resetSeedTables();

  const adminUserId = randomUUID();
  const companyId = randomUUID();
  const companyUserId = randomUUID();

  const familyRows = familySeeds.map(({ id, name, slug, image, sortOrder }) => ({
    id,
    name,
    slug,
    image,
    sortOrder
  }));

  const subfamilyRows = subfamilySeeds.map(({ id, familyKey, name, slug, sortOrder }) => ({
    id,
    familyId: familySeeds.find((family) => family.slug === familyKey)!.id,
    name,
    slug,
    sortOrder
  }));

  const articleRows = articleSeeds.map(
    ({ id, subfamilyKey, erpCode, name, slug, description, brand, unit, mainImage }) => ({
      id,
      subfamilyId: subfamilySeeds.find((subfamily) => subfamily.slug === subfamilyKey)!.id,
      erpCode,
      name,
      slug,
      description,
      brand,
      unit,
      mainImage,
      isActive: true,
      lastSyncedAt: new Date()
    })
  );

  const articlePriceRows = articleSeeds.flatMap(({ id, publicPrice, b2bPrice }) => [
    {
      articleId: id,
      priceListCode: "PUBLIC",
      price: publicPrice,
      currency: "EUR"
    },
    {
      articleId: id,
      priceListCode: "PRO_01",
      price: b2bPrice,
      currency: "EUR"
    }
  ]);

  await db.insert(users).values([
    {
      id: adminUserId,
      email: "admin@ferreteria.local",
      passwordHash: "$2b$10$Gc.IFhyzdN61Ey5KiDPR3ey3r2XgHXNBPRFVKVDgvWcPnotdHIjiy",
      name: "Administración",
      type: "ADMIN",
      status: "ACTIVE"
    }
  ]);

  await db.insert(companies).values([
    {
      id: companyId,
      legalName: "Construcciones Atlántico SL",
      taxId: "B12345678",
      contactPhone: "+34 922 222 222",
      priceListCode: "PRO_01",
      approvedAt: new Date(),
      approvedByUserId: adminUserId
    }
  ]);

  await db.insert(users).values([
    {
      id: companyUserId,
      email: "empresa@atlanticoconstruye.local",
      passwordHash: "$2b$10$Gc.IFhyzdN61Ey5KiDPR3ey3r2XgHXNBPRFVKVDgvWcPnotdHIjiy",
      name: "Carlos Pérez",
      type: "B2B",
      status: "ACTIVE",
      companyId
    }
  ]);

  await db.insert(families).values(familyRows);
  await db.insert(subfamilies).values(subfamilyRows);
  await db.insert(articles).values(articleRows);
  await db.insert(articlePrices).values(articlePriceRows);
  await db.insert(articleImages).values(
    articleSeeds.map(({ id, mainImage }, index) => ({
      articleId: id,
      url: mainImage,
      sortOrder: index
    }))
  );
  await db.insert(stores).values(storeSeeds);
  await db.insert(faqs).values(faqSeeds);

  await db.insert(importBatches).values([
    {
      fileName: "seed-import.csv",
      type: "CSV",
      status: "SUCCESS",
      startedAt: new Date(),
      finishedAt: new Date(),
      totalRows: articleSeeds.length,
      successRows: articleSeeds.length,
      errorRows: 0,
      errorLog: "[]"
    }
  ]);

  await db.insert(favorites).values([
    {
      userId: companyUserId,
      articleId: articleSeeds[0].id
    }
  ]);

  await db.insert(infoRequests).values([
    {
      name: "Laura Gómez",
      email: "laura.gomez@example.com",
      phone: "+34 600 000 000",
      message: "Quiero confirmar disponibilidad de varios artículos para una reforma.",
      storeId: storeSeeds[0].id,
      articleId: articleSeeds[1].id,
      userId: companyUserId,
      status: "NEW"
    }
  ]);

  console.log("Seed completed successfully.");
  console.log(`Admin: admin@ferreteria.local / seeded password hash`);
  console.log(`Company: Construcciones Atlántico SL (${companyId})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
