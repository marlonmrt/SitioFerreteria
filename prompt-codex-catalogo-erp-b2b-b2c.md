# PROMPT MAESTRO PARA CODEX
## Catálogo Web Informativo sincronizado con ERP — Acceso B2B / B2C
### (Stack 100% gratuito — Next.js + Drizzle ORM + shadcn/ui)

---

## 0. CONTEXTO DEL PROYECTO (pegar siempre al inicio)

Eres un agente de desarrollo (Codex) actuando como **ingeniero senior full-stack**. Vas a construir, **fase por fase**, una **web informativa de catálogo** (NO e-commerce: sin carrito, sin checkout, sin pasarela de pago) para un negocio con tiendas físicas, cuyo único origen de verdad para los artículos es un **sistema ERP externo ya existente**.

Reglas de negocio clave:
1. **La web NO gestiona stock ni pedidos.** Solo muestra artículos (nombre, descripción, familia/subfamilia, imágenes, precio orientativo, disponibilidad informativa "consultar en tienda") que provienen del ERP.
2. **Origen de datos:** el ERP exporta periódicamente **ficheros CSV/Excel** (no hay API). La app debe tener un módulo de **importación/sincronización** que lea esos ficheros (subida manual desde el panel admin y/o carpeta watch + cron) y actualice la base de datos local, que actúa como **caché de lectura** del ERP.
3. **Catálogo público:** cualquier visitante, sin login, puede navegar y ver todos los artículos y su precio público (B2C).
4. **Login diferenciado:**
   - **B2C** (particulares): login opcional, solo para funciones de valor añadido (favoritos, alertas, historial de búsquedas, solicitar info de un producto). No afecta a lo que se ve del catálogo.
   - **B2B** (empresas/profesionales): login obligatorio para ver condiciones especiales — tarifa neta/descuento asignado, referencia interna, posibilidad de descargar listado de precios en PDF/Excel. El alta B2B requiere **validación manual por un administrador** (verificación de CIF/empresa) antes de activarse.
5. No hay compra online: las fichas de producto llevan un CTA tipo **"Consultar disponibilidad"** o **"Solicitar presupuesto"** (formulario de contacto), no "Añadir al carrito".

**No avances de fase sin que la fase anterior compile, levante (`npm run dev` / `npm run build`) y cumpla sus criterios de aceptación.** Al final de cada fase, entrega un resumen de archivos creados/modificados y los comandos para probarlo.

---

## 1. STACK TECNOLÓGICO OBLIGATORIO (100% gratuito / open source)

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | **Next.js 15+ (App Router, TypeScript estricto)** | — |
| ORM | **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`) | Apache 2.0, sin coste, sin binario nativo, funciona en Node/Edge/serverless sin servicios de pago (a diferencia de Prisma Accelerate para edge). Schema definido en TypeScript puro, migraciones SQL generadas y auditables. |
| Driver DB | `postgres` (postgres.js) o `pg` + PostgreSQL | Gratuito; puede alojarse en Supabase/Neon (planes free) |
| UI | **shadcn/ui** + Tailwind CSS | — |
| Formularios | React Hook Form + Zod | — |
| Auth | Auth.js (NextAuth v5) con adapter de Drizzle (`@auth/drizzle-adapter`) | Gratuito, soporta credenciales + roles |
| Importación CSV/Excel | `papaparse` (CSV) y `exceljs` o `xlsx` (Excel) | Librerías gratuitas/MIT |
| Tareas programadas | Vercel Cron Jobs (gratis en plan Hobby con límites) o `node-cron` si se autohospeda | — |
| Testing | Vitest + Playwright | — |
| Despliegue | Vercel (frontend) + Neon/Supabase (Postgres, planes free) | — |

> **Nota sobre el ORM:** se descarta Prisma como opción por defecto porque, aunque su core sigue siendo open source, su uso en runtimes edge depende de servicios adicionales (Data Proxy/Accelerate) y de un paso de generación de cliente. **Drizzle ORM** es la alternativa recomendada en 2026 para proyectos Next.js que quieren quedarse 100% en código abierto, sin generación de cliente y con menor huella en build/despliegue.

### Reglas transversales para Codex
1. Código y nombres en **inglés**; textos visibles al usuario en **español (es-ES)**.
2. Server Components por defecto; cliente solo donde hay interactividad real (filtros, formulario de login, favoritos).
3. Toda consulta a la base de datos pasa por `lib/db/queries/*` (capa de acceso a datos con Drizzle), nunca queries sueltas dentro de componentes.
4. La tabla de artículos es **de solo lectura desde el storefront**: únicamente el módulo de importación y el panel admin pueden escribir en ella.
5. Variables de entorno documentadas en `.env.example`.
6. Accesibilidad AA, responsive mobile-first.
7. Al finalizar cada fase: `npm run lint`, `npm run build` y tests existentes antes de continuar.

---

## FASE 0 — Setup inicial y arquitectura base

Tareas:
1. Crear proyecto con `create-next-app` (TypeScript, App Router, Tailwind, ESLint).
2. Inicializar **shadcn/ui** y añadir componentes base: `button`, `card`, `input`, `form`, `dialog`, `sheet`, `navigation-menu`, `badge`, `skeleton`, `table`, `tabs`, `select`, `accordion`, `separator`, `avatar`, `sonner` (toasts).
3. Instalar **Drizzle**: `drizzle-orm`, `drizzle-kit`, driver `postgres`. Crear `drizzle.config.ts` y `lib/db/index.ts` (cliente singleton).
4. Estructura de carpetas:
   ```
   app/
     (public)/            ← catálogo público
     (auth)/               ← login/registro B2C y B2B
     (account)/            ← área cliente logueado
     admin/                ← panel administración + importación ERP
     api/
   components/
     ui/                  ← shadcn
     catalog/
     admin/
     shared/
   lib/
     db/
       schema/            ← tablas Drizzle
       queries/
       index.ts
     auth/
     import/              ← parsers CSV/Excel y mapeo
     validators/          ← esquemas zod
   drizzle/                ← migraciones generadas
   ```
5. Tema visual de marca (industrial/cálido), layout con header (logo, buscador, botón "Acceder" con submenú "Soy particular / Soy empresa") y footer (tiendas, horarios, contacto).
6. Home `/` placeholder.

**Criterios de aceptación:** `npm run dev` y `npm run build` sin errores; `drizzle-kit` conecta y puede generar migraciones vacías.

---

## FASE 1 — Modelado de datos (Drizzle Schema)

Tablas mínimas (`lib/db/schema/*.ts`):

- `users` (id, email, passwordHash, name, type: `B2C`|`B2B`|`ADMIN`, status: `ACTIVE`|`PENDING`|`REJECTED`, companyId FK nullable, createdAt)
- `companies` (id, legalName, taxId/CIF, contactPhone, priceListCode, approvedAt, approvedBy)
- `families` (id, name, slug, image, sortOrder)
- `subfamilies` (id, familyId FK, name, slug)
- `articles` (id, erpCode **[clave de negocio venida del ERP, única]**, name, slug, description, brand, unit, subfamilyId FK, mainImage, isActive, lastSyncedAt)
- `articleImages` (id, articleId FK, url, sortOrder)
- `articlePrices` (id, articleId FK, priceListCode (`PUBLIC` para B2C, o el código de tarifa B2B), price, currency, updatedAt) — permite varias tarifas por artículo
- `stores` (id, name, address, phone, openingHours, lat, lng)
- `favorites` (userId FK, articleId FK)
- `infoRequests` (id, articleId FK nullable, userId FK nullable, name, email, phone, message, storeId FK nullable, createdAt, status)
- `importBatches` (id, fileName, type: `CSV`|`XLSX`, startedAt, finishedAt, status, totalRows, successRows, errorRows, errorLog)
- `faqs` (id, question, answer, sortOrder)

Tareas:
1. Definir todas las tablas con relaciones (`relations()` de Drizzle), índices únicos (`erpCode`, `slug`).
2. Generar migración con `drizzle-kit generate` y aplicarla (`drizzle-kit migrate`).
3. Seed (`lib/db/seed.ts`) con: 2 tiendas, 6 familias reales del negocio (Baños, Cerámicas, Climatización, Construcción, Hogar y Electrodomésticos, Sellado y Fijación), 2-3 subfamilias por familia, 20 artículos de ejemplo con precio `PUBLIC` y precio de una tarifa B2B ficticia, 1 empresa B2B de ejemplo, 5 FAQs.
4. Documentar el ERD en `/docs/erd.md` (diagrama Mermaid).

**Criterios de aceptación:** migración aplicada sin errores; Drizzle Studio (`drizzle-kit studio`) muestra los datos sembrados.

---

## FASE 2 — Módulo de importación desde el ERP (CSV/Excel)

**Objetivo:** este es el corazón del sistema: mantener `articles`/`articlePrices` sincronizados con lo que exporta el ERP, sin intervención manual de catálogo.

Tareas:
1. **Parser** en `lib/import/`: función que recibe un fichero (`.csv` o `.xlsx`), lo parsea (`papaparse` / `exceljs`) y lo normaliza a un array de objetos tipados.
2. **Mapeo de columnas configurable**: tabla/config (puede ser un JSON en `lib/import/mapping.ts` inicialmente) que traduce las cabeceras del fichero del ERP (ej. `COD_ART`, `DESCRIPCION`, `PRECIO_PVP`, `FAMILIA`) a los campos internos (`erpCode`, `name`, `price`, `family`). Debe poder ajustarse sin tocar lógica de parseo.
3. **Proceso de importación (upsert)**: por cada fila, `upsert` en `articles` por `erpCode`, crear `articlePrices` (tarifa `PUBLIC` y, si el fichero trae más columnas de tarifa, una fila por tarifa B2B), resolver/crear `families`/`subfamilies` si no existen. Todo dentro de una transacción Drizzle por lote (batch de N filas) para no bloquear la tabla.
4. **Registro de auditoría**: cada ejecución crea un `importBatches` con contadores de éxito/error y un log de filas con error (fila + motivo).
5. **Dos formas de disparo**:
   - Manual: pantalla en `/admin/importaciones` con subida de fichero (`input type=file`), barra de progreso, resultado.
   - Automática: ruta `api/cron/import` protegida por un secreto (`CRON_SECRET`), pensada para Vercel Cron, que lee el último fichero de una carpeta/bucket configurado (o de un endpoint donde el ERP deja el export) y ejecuta la misma función de importación.
6. **Artículos discontinuados:** si un `erpCode` deja de aparecer en N importaciones consecutivas, marcar `isActive = false` (no borrar) para no romper enlaces/SEO.

**Criterios de aceptación:**
- Subir un CSV/XLSX de prueba desde `/admin/importaciones` crea/actualiza artículos visibles en el catálogo.
- El historial de importaciones muestra batches con sus contadores.
- Una segunda importación con datos modificados actualiza precios sin duplicar artículos.

---

## FASE 3 — Autenticación B2B / B2C

Tareas:
1. Auth.js + `@auth/drizzle-adapter`, `CredentialsProvider` (bcrypt).
2. **Registro B2C** (`/registro`): alta inmediata, usuario queda `ACTIVE`.
3. **Registro B2B** (`/registro-empresa`): formulario con datos de empresa (razón social, CIF, teléfono, persona de contacto) → crea `companies` + `users` con `status = PENDING`. El usuario recibe mensaje "Tu solicitud está en revisión".
4. **Aprobación B2B** en `/admin/empresas`: el admin revisa solicitudes pendientes, asigna `priceListCode` (tarifa) y aprueba/rechaza. Al aprobar, el usuario pasa a `ACTIVE` y puede loguearse.
5. `/login` único con detección de tipo de usuario tras autenticar (redirige a `/mi-cuenta` B2C o `/mi-cuenta-empresa` B2B según `type`).
6. Middleware: el catálogo público (`(public)`) **nunca** exige login. Solo `(account)` y `admin` están protegidos. Las fichas de producto consultan la sesión (si existe y es B2B activo) para decidir qué `priceListCode` mostrar; si no hay sesión o es B2C, se muestra siempre `PUBLIC`.

**Criterios de aceptación:**
- Un visitante anónimo ve el catálogo completo con precio público.
- Una empresa registrada y aprobada, al loguearse, ve su tarifa especial en la ficha de producto.
- Una empresa con solicitud `PENDING` no puede loguearse (mensaje claro de "cuenta en revisión").

---

## FASE 4 — Catálogo informativo (Home, familias, ficha de producto, buscador)

Tareas:
1. **Home (`/`)**: hero, grid de familias (Baños, Cerámicas, Climatización...), bloque de tiendas (horario/teléfono), aviso de "catálogo informativo, consulte disponibilidad en tienda".
2. **Listado por familia** `/familias/[slug]`: filtros por subfamilia/marca, grid de `card` con imagen, nombre, precio público (o tarifa B2B si aplica), badge de familia.
3. **Ficha de artículo** `/articulos/[slug]`: galería, descripción, precio según sesión, ficha técnica (marca, unidad, código ERP visible u oculto según config), botón **"Solicitar información / presupuesto"** que abre un formulario (`infoRequests`) en vez de "Comprar"; sin selector de cantidad para compra (puede mantenerse solo si es "cantidad orientativa para el presupuesto").
4. **Buscador** con autocompletado server-side por nombre/código.
5. **Favoritos** (B2C/B2B logueados): botón de corazón en card/ficha, listado en `/mi-cuenta/favoritos`.
6. Metadatos SEO por familia/artículo (`generateMetadata`).

**Criterios de aceptación:** navegación completa Home → Familia → Artículo funcionando con datos reales importados en Fase 2; el precio mostrado cambia correctamente según el tipo de sesión.

---

## FASE 5 — Panel de administración

Tareas:
1. Layout `admin/` protegido por rol `ADMIN`: Dashboard, Importaciones (Fase 2), Empresas/Aprobaciones (Fase 3), Artículos (solo lectura + posibilidad de desactivar manualmente uno si hace falta), Solicitudes de información, Tiendas, FAQ/Contenido.
2. Vista de **Solicitudes de información** (`infoRequests`): listado, filtro por estado (`NUEVA`/`ATENDIDA`), detalle, cambio de estado.
3. Dashboard simple: nº artículos activos, última importación (fecha/estado), empresas pendientes de aprobar, solicitudes nuevas.

**Criterios de aceptación:** un admin gestiona el ciclo completo: importar catálogo, aprobar una empresa, atender una solicitud de información.

---

## FASE 6 — Contenido institucional

Tareas:
1. `/conocenos`, `/tiendas` (tarjeta por tienda con mapa embebido), `/faq` (accordion alimentado por `faqs`), `/contacto` (formulario → `infoRequests` sin `articleId`).
2. Footer con redes sociales, aviso legal, política de privacidad/cookies.
3. `sitemap.xml`, `robots.txt`, Open Graph.

**Criterios de aceptación:** todas las páginas accesibles desde menú/footer y enlazadas en el sitemap.

---

## FASE 7 — Calidad, rendimiento y despliegue

Tareas:
1. Optimización de imágenes (`next/image`), ISR/`revalidate` en páginas de catálogo (los datos cambian solo cuando hay importación, así que se puede revalidar on-demand tras cada `importBatch` exitoso con `revalidatePath`).
2. Tests: unitarios sobre el parser/mapeo de importación (casos con filas erróneas, columnas faltantes) y sobre la resolución de precio por tipo de usuario; e2e (Playwright) de navegación pública y de aprobación B2B.
3. Seguridad: proteger `api/cron/import` con secreto, sanitizar ficheros subidos (tamaño máximo, extensión), rate limiting en formularios públicos.
4. Documentar despliegue: Vercel + Neon/Supabase (free tier), variables de entorno, Vercel Cron para importación automática, `drizzle-kit migrate` en CI/CD.
5. README final con arquitectura, diagrama de flujo ERP → importación → catálogo, y guía de cómo añadir una nueva tarifa B2B o un nuevo mapeo de columnas.

**Criterios de aceptación:** build y tests en verde; documentación suficiente para que alguien sin contexto previo pueda desplegar y operar el sistema (incluida la importación periódica).

---

## 2. CÓMO USAR ESTE PROMPT CON CODEX

- Pega este documento completo y pide a Codex: *"Empieza por la Fase 0. No avances de fase sin que se cumplan los criterios de aceptación."*
- Para cada importación de prueba en Fase 2, prepara un CSV/XLSX de ejemplo con cabeceras reales del ERP y pégalo en el repo como fixture (`/fixtures/erp-export-sample.csv`) para que Codex pueda probar el parser sin depender de un fichero real.
- Si el formato exacto del export del ERP (nombres de columnas, separador, codificación) está disponible, añádelo como anexo a la Fase 2 antes de ejecutarla: mejora mucho la precisión del mapeo.
