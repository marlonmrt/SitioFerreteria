const postgres = require('postgres');
const NEON_URL = 'postgresql://neondb_owner:npg_Cw4qSL9ObEIj@ep-delicate-bread-abbge8lh-pooler.eu-west-2.aws.neon.tech/mi_catalogo_db?sslmode=require&channel_binding=require';

async function main() {
  const sql = postgres(NEON_URL, { max: 1 });
  try {
    // 1. Insert admin user (no company)
    await sql`INSERT INTO public.users (id, email, password_hash, name, type, status, company_id, created_at)
      VALUES ('092638b7-dca3-44e6-b807-c49655880122', 'admin@ferreteria.local', '$2b$10$Gc.IFhyzdN61Ey5KiDPR3ey3r2XgHXNBPRFVKVDgvWcPnotdHIjiy', 'Administración', 'ADMIN', 'ACTIVE', NULL, '2026-06-21 17:14:48.422986+00')
      ON CONFLICT (id) DO NOTHING`;
    console.log('✓ Admin user inserted');

    // 2. Insert companies (without approved_by yet)
    await sql`INSERT INTO public.companies (id, legal_name, tax_id, contact_phone, price_list_code, created_at)
      VALUES ('608659ec-c59f-40cc-acb3-930217da4199', 'Construcciones Atlántico SL', 'B12345678', '+34 922 222 222', 'PRO_01', '2026-06-21 17:14:48.425509+00')
      ON CONFLICT (id) DO NOTHING`;
    await sql`INSERT INTO public.companies (id, legal_name, tax_id, contact_phone, price_list_code, created_at)
      VALUES ('739a3ae8-f4d0-40d5-a2a6-42332c6ba1e7', 'construc', 'B1555469', '+34687424074', 'PRO_01', '2026-06-22 11:47:23.939143+00')
      ON CONFLICT (id) DO NOTHING`;
    console.log('✓ Companies inserted');

    // 3. Update companies with approved_by
    await sql`UPDATE public.companies SET approved_by_user_id = '092638b7-dca3-44e6-b807-c49655880122' WHERE id IN ('608659ec-c59f-40cc-acb3-930217da4199', '739a3ae8-f4d0-40d5-a2a6-42332c6ba1e7')`;
    console.log('✓ Companies updated with approved_by');

    // 4. Insert remaining users
    await sql`INSERT INTO public.users (id, email, password_hash, name, type, status, company_id, created_at)
      VALUES ('6d2b3b7c-5ae1-450b-b7cf-4ffc9a6be1b8', 'empresa@atlanticoconstruye.local', '$2b$10$Gc.IFhyzdN61Ey5KiDPR3ey3r2XgHXNBPRFVKVDgvWcPnotdHIjiy', 'Carlos Pérez', 'B2B', 'ACTIVE', '608659ec-c59f-40cc-acb3-930217da4199', '2026-06-21 17:14:48.428098+00')
      ON CONFLICT (id) DO NOTHING`;
    await sql`INSERT INTO public.users (id, email, password_hash, name, type, status, company_id, created_at)
      VALUES ('3e850c8e-b393-427e-b01f-f3b8dad4407d', 'revdfsdsd@asdf.com', '$2b$10$OzrlMAnhoGbdXs8A5keyL.8EL2TH1Y217ghWhqAaobXod.uKhqmYq', 'ROBERTO FRÍAS HERNANDEZ', 'B2B', 'ACTIVE', '739a3ae8-f4d0-40d5-a2a6-42332c6ba1e7', '2026-06-22 11:47:23.939143+00')
      ON CONFLICT (id) DO NOTHING`;
    await sql`INSERT INTO public.users (id, email, password_hash, name, type, status, company_id, created_at)
      VALUES ('d10cbc4a-b73a-4016-9e26-ebfbca1306ea', 'asd@asd.om', '$2b$10$3LcfCxHRdGoBxg353EOVpOgwH8zYyN.CUxHR8YuFJ3JeExzLGRfLG', 'marlon', 'B2C', 'ACTIVE', NULL, '2026-06-22 11:44:03.785628+00')
      ON CONFLICT (id) DO NOTHING`;
    await sql`INSERT INTO public.users (id, email, password_hash, name, type, status, company_id, created_at)
      VALUES ('fdc34d85-a4eb-4a17-a4cf-1829552686c2', 'asdasd@sdsd.ocm', '$2b$10$U1nBFiuUptdJJSmAy2FfJ.SgdTVWighQiOaUc5yy2zyBCA06.4NZW', 'Collares', 'B2C', 'ACTIVE', NULL, '2026-06-22 11:44:25.1456+00')
      ON CONFLICT (id) DO NOTHING`;
    console.log('✓ Remaining users inserted');

    // 5. Insert favorites
    await sql`INSERT INTO public.favorites (user_id, article_id, created_at)
      VALUES ('6d2b3b7c-5ae1-450b-b7cf-4ffc9a6be1b8', '58b50ae7-f7d2-4ac9-94ec-adad66f03258', '2026-06-21 17:14:48.450506+00')
      ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO public.favorites (user_id, article_id, created_at)
      VALUES ('092638b7-dca3-44e6-b807-c49655880122', 'a1145c50-8219-489e-a249-7d301c6f9530', '2026-06-23 01:08:11.456276+00')
      ON CONFLICT DO NOTHING`;
    console.log('✓ Favorites inserted');

    // 6. Insert info_requests
    await sql`INSERT INTO public.info_requests (id, article_id, user_id, name, email, phone, message, store_id, created_at, status)
      VALUES ('8b9fbfe4-3a2d-4e1d-ad3d-2b8ee29f26b4', 'cb6c0ca5-d44c-4573-94bc-d350256b939c', '6d2b3b7c-5ae1-450b-b7cf-4ffc9a6be1b8', 'Laura Gómez', 'laura.gomez@example.com', '+34 600 000 000', 'Quiero confirmar disponibilidad de varios artículos para una reforma.', '48c22661-cb17-4f02-852a-8efc78960ea6', '2026-06-21 17:14:48.452464+00', 'NEW')
      ON CONFLICT (id) DO NOTHING`;
    await sql`INSERT INTO public.info_requests (id, article_id, user_id, name, email, phone, message, store_id, created_at, status)
      VALUES ('4599610a-ce4e-4aa8-90b3-3d0b876ea3e4', '93559630-b834-42b2-ab0f-7a7726cd5235', NULL, 'MARLON RODRIGUEZ TOLEDO', 'Marlon.mrt@gmail.com', '+34619494251', 'Hola, me gustaría solicitar información y presupuesto sobre el artículo "Split inverter 2.5 kW" (Referencia: CLI-AC-001). Quedo a la espera de sus comentarios.', '48c22661-cb17-4f02-852a-8efc78960ea6', '2026-06-22 11:37:47.708094+00', 'NEW')
      ON CONFLICT (id) DO NOTHING`;
    console.log('✓ Info requests inserted');

    // Verify
    console.log('\n=== VERIFICATION ===');
    const counts = [
      'public.users', 'public.companies', 'public.favorites', 'public.info_requests',
      'public.articles', 'public.families', 'public.subfamilies', 'public.article_prices',
      'public.article_images', 'public.menu_items', 'public.stores', 'public.faqs',
      'public.import_batches', 'public.carousel_slides'
    ];
    for (const t of counts) {
      const [r] = await sql.unsafe(`SELECT COUNT(*)::int AS cnt FROM ${t}`);
      console.log(`  ${t.padEnd(35)} ${r.cnt} rows`);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await sql.end();
  }
}
main();
