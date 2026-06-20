# Guía de Despliegue en Producción

Esta guía detalla el proceso completo para compilar, configurar y desplegar la aplicación de **Catálogo Web Informativo sincronizado con ERP** en producción, utilizando **Vercel** como hosting de frontend y **Supabase** o **Neon** para base de datos gestionada PostgreSQL.

---

## 📋 Requisitos Previos
* Cuenta en [Vercel](https://vercel.com).
* Una instancia activa de base de datos PostgreSQL (Neon, Supabase o AWS RDS).
* Node.js v20 o v22 instalado localmente para pruebas de compilación y comandos CLI.

---

## 🌐 Configuración de la Base de Datos
1. Obtén la cadena de conexión de tu base de datos de producción (ej. `postgresql://usuario:contraseña@host:puerto/db?sslmode=require`).
2. Configura tu cadena en local dentro de tu archivo `.env` o en la consola de Vercel como `DATABASE_URL`.
3. Ejecuta las migraciones Drizzle localmente apuntando a la base de datos de producción:
   ```bash
   npm run drizzle:migrate
   ```
4. (Opcional) Si deseas inicializar la base de datos con los datos semilla (tiendas, familias, subfamilias y artículos de demostración):
   ```bash
   npm run db:seed
   ```

---

## ⚙️ Variables de Entorno
Debes configurar las siguientes variables de entorno en la sección **Environment Variables** de tu proyecto en Vercel:

| Variable | Tipo / Valor sugerido | Descripción |
| :--- | :--- | :--- |
| `DATABASE_URL` | Secreta (PostgreSQL Connection String) | URL de conexión directa a PostgreSQL con soporte SSL activo. |
| `AUTH_SECRET` | Secreta (Generada por ti) | Clave única utilizada por Auth.js para encriptar cookies de sesión. Genérala en la terminal con `openssl rand -base64 33`. |
| `CRON_SECRET` | Secreta (Clave compartida) | Token Bearer para autenticar el Cron-Job de sincronización con el ERP. |
| `NEXT_PUBLIC_APP_URL` | Pública (ej. `https://mi-ferreteria.com`) | URL pública absoluta de tu sitio web para construir el sitemap.xml de forma correcta. |

---

## 🚀 Despliegue en Vercel

1. **Importar Proyecto:**
   * Ve a la consola de Vercel, crea un nuevo proyecto e impórtalo desde tu repositorio de GitHub.
2. **Framework Preset:**
   * Selecciona **Next.js** (detectado automáticamente).
3. **Comando de Compilación:**
   * El comando por defecto es `next build` (equivalente a `npm run build`).
4. **Variables de Entorno:**
   * Introduce cada una de las variables indicadas en la tabla superior.
5. **Implementar:**
   * Haz clic en **Deploy**. Vercel se encargará de compilar las rutas y optimizar el código.

---

## ⏰ Sincronización Automática con el ERP (Cron Job)

El sistema expone un endpoint seguro en `/api/cron/import` que ejecuta la sincronización leyendo el fichero exportado por el ERP (en `fixtures/erp-export-sample.csv`).

Para configurar el Cron Job automatizado en Vercel:

1. Agrega el archivo `vercel.json` en la raíz del proyecto (si no existe):
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/import",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```
   *(Este cron se ejecutará todas las noches a las 02:00 AM UTC).*
2. Asegúrate de configurar la variable `CRON_SECRET` en Vercel. Vercel pasará automáticamente este token en la cabecera `Authorization: Bearer <CRON_SECRET>` al invocar el endpoint, garantizando que nadie pueda disparar la importación externamente.

---

## 🔒 Consideraciones de Seguridad
* **Endpoints Protegidos:** Las APIs `/api/admin/import` están protegidas tanto por control de sesión de Auth.js (requiere rol de `ADMIN`) como por middleware de redirección.
* **Caché bajo demanda:** Tras una importación automática o manual exitosa, el sistema invalida la caché de la Home (`/`), familias (`/familias/[slug]`) y fichas de producto (`/articulos/[slug]`) garantizando que los usuarios vean los precios vigentes sin retardos.
