# Estado del proyecto

Fecha de corte: 2026-06-20

Este documento resume qué partes del prompt inicial ya están implementadas en el repo y qué queda pendiente.

## Resumen ejecutivo

### Hecho

- Fase 0: base del proyecto Next.js + Tailwind + ESLint + TypeScript.
- Layout principal con header, footer, home placeholder y páginas de acceso inicial.
- Set base de componentes UI tipo shadcn/ui.
- Configuración de Drizzle ORM y Drizzle Kit.
- Fase 1: schema Drizzle definido para todas las tablas principales.
- Fase 1: relaciones Drizzle definidas.
- Fase 1: ERD documentado en Mermaid.
- Fase 1: migraciones generadas con Drizzle.
- Fase 1: migración aplicada con éxito contra la base de datos `mi_catalogo_db` usando el `DATABASE_URL` proporcionado.
- Fase 1: configurar archivo `.env` local con `DATABASE_URL` y ejecutar `db:seed` de forma exitosa.
- Fase 1: verificar datos sembrados mediante logs e inserciones en base de datos.

### Pendiente

- Fase 2 en adelante: todavía no empezadas.

## Fase 0

### Implementado

- Proyecto inicial en Next.js 15 con App Router y TypeScript estricto.
- Tailwind configurado.
- ESLint configurado.
- Estructura de carpetas base:
  - `app/(public)`
  - `app/(auth)`
  - `app/(account)`
  - `app/admin`
  - `app/api`
  - `components/ui`
  - `components/shared`
  - `components/catalog`
  - `components/admin`
  - `lib/db`
  - `lib/auth`
  - `lib/import`
  - `lib/validators`
- Tema visual industrial/cálido con header, footer y home de marca.
- Componentes UI base creados:
  - `button`
  - `card`
  - `input`
  - `form`
  - `dialog`
  - `sheet`
  - `navigation-menu`
  - `badge`
  - `skeleton`
  - `table`
  - `tabs`
  - `select`
  - `accordion`
  - `separator`
  - `avatar`
  - `sonner`
- Drizzle config preparada con `drizzle.config.ts`.
- Archivo `.env.example` creado.

### Pendiente

- Ajustes de contenido real y navegación definitiva cuando entren fases funcionales.

## Fase 1

### Implementado

- Tablas definidas:
  - `users`
  - `companies`
  - `families`
  - `subfamilies`
  - `articles`
  - `articleImages`
  - `articlePrices`
  - `stores`
  - `favorites`
  - `infoRequests`
  - `importBatches`
  - `faqs`
- Relaciones entre tablas definidas con `relations()`.
- Índices únicos y claves de negocio:
  - `erpCode` único
  - `slug` único en familias, subfamilias y artículos
  - `taxId` único en empresas
  - `priceListCode` único en empresas
  - `email` único en usuarios
  - PK compuesta en `favorites`
- Tipos/enums creados:
  - `user_type`
  - `user_status`
  - `import_file_type`
  - `import_batch_status`
  - `info_request_status`
- ERD documentado en:
  - [docs/erd.md](./erd.md)
- Seed de referencia creado en:
  - [lib/db/seed.ts](../lib/db/seed.ts)
- Migraciones generadas:
  - `drizzle/0000_hesitant_power_man.sql`
  - `drizzle/0001_foamy_whirlwind.sql`
- Migración aplicada con éxito a la base de datos indicada por el usuario.
- Ejecutado `npm run db:seed` de forma exitosa con la base de datos `mi_catalogo_db` conectada y cargados los datos semilla (tiendas, familias, subfamilias, artículos, etc.).

### Pendiente

- Confirmar si hay que añadir constraints adicionales o `onDelete` específicos para negocio antes de pasar a Fase 2.

## Fases futuras

### Fase 2

- Parser CSV/XLSX.
- Mapeo configurable de columnas.
- Upsert de artículos, precios y familias.
- Registro de lotes de importación.
- Endpoint cron y pantalla de importación.
- Gestión de artículos discontinuados.

### Fase 3

- Auth.js + adapter Drizzle.
- Registro B2C.
- Registro y aprobación B2B.
- Login único con redirección por tipo.
- Middleware de protección por rol.

### Fase 4

- Home real de catálogo.
- Listado por familia.
- Ficha de artículo.
- Buscador.
- Favoritos.

### Fase 5

- Panel de administración.
- Dashboard.
- Gestión de importaciones.
- Aprobación de empresas.
- Solicitudes de información.

### Fase 6

- Conócenos, tiendas, FAQ, contacto.
- Sitemap, robots y metadatos sociales.

### Fase 7

- Optimización de imágenes y revalidación.
- Tests unitarios y e2e.
- Seguridad y rate limiting.
- Documentación de despliegue.

## Comandos útiles

```bash
npm run lint
npm run build
npm run drizzle:generate
npm run drizzle:migrate
npm run db:seed
```

## Notas

- El catálogo público sigue siendo un placeholder funcional hasta Fase 4.
- La base de datos ya tiene el esquema aplicado, pero el seed todavía debe reejecutarse tras el último ajuste del módulo de DB.
