-- ============================================================
-- Bloque 7: Datos restantes (menús, tiendas, FAQs, import_batches)
-- ============================================================
-- Este bloque completa las tablas que NO se incluyeron en
-- los bloques 1-6: menu_items, stores, faqs, import_batches.
-- Ejecutar DESPUÉS de haber migrado el esquema (drizzle-kit) y
-- los bloques 1-6.

-- 1. Menú del sitio (nodos padre primero para respetar FK circular)
INSERT INTO public.menu_items (id, label, href, parent_id, sort_order, is_active, created_at) VALUES
('2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 'Productos', '/articulos', NULL, 0, true, '2026-06-21 14:55:02.996985+00'),
('2e1f92c8-6e2d-465b-979c-844a19259bbd', 'Ofertas', '/articulos', NULL, 0, true, '2026-06-21 09:08:49.046071+00'),
('798dfc02-e56d-439b-b756-244f66a0b00e', 'Conócenos', '/conocenos', NULL, 1, true, '2026-06-21 09:46:50.941755+00'),
('6415daa1-b824-41c8-b058-e417b29eb29d', 'Contacto', '/contacto', NULL, 2, true, '2026-06-21 09:46:56.922366+00'),
('0e17eba9-afce-4fc1-96b0-0081f46b2f10', 'Tiendas', '/tiendas', NULL, 3, true, '2026-06-21 09:37:14.718903+00')
ON CONFLICT (id) DO NOTHING;

-- 2. Sub-elementos del menú (dependen de los padres anteriores)
INSERT INTO public.menu_items (id, label, href, parent_id, sort_order, is_active, created_at) VALUES
('93f53d6e-b150-4d4e-9d02-9e6b03a86ec6', 'Baños', '/familias/banos', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:55:20.715998+00'),
('2741e951-f98c-4a38-887b-ead51181c4d4', 'Cerámicas', '/familias/ceramicas', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:55:52.565683+00'),
('bddc8158-af25-4fa3-b1ab-aa502ba6a346', 'Construcción', '/familias/construccion', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:56:08.801921+00'),
('b10e8be4-585b-48e3-a74e-6874bbb2be1e', 'Hogar y Electrodomésticos', '/familias/hogar-electrodomesticos', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:56:15.737391+00'),
('3704ce43-59bd-42fc-b1fb-5d73b9301f96', 'Sellado y Fijación', '/familias/sellado-fijacion', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:56:27.022611+00'),
('6661dc36-20f3-4174-8ab4-fc78526b7da0', 'Climatización', '/familias/climatizacion', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 15:02:35.418782+00')
ON CONFLICT (id) DO NOTHING;

-- 3. Tiendas
INSERT INTO public.stores (id, name, address, phone, opening_hours, lat, lng) VALUES
('48c22661-cb17-4f02-852a-8efc78960ea6', 'Tienda Central', 'C/ Principal 123, Santa Cruz de Tenerife', '+34 922 000 000', 'L-V 08:00-19:00 | S 09:00-13:00', 28.4636, -16.2518),
('5bbf35cd-416b-4076-ba1c-05ee1f01d0bf', 'Sucursal Sur', 'Av. Comercio 45, Adeje', '+34 922 111 111', 'L-V 08:30-18:30 | S 09:00-13:00', 28.1227, -16.7245)
ON CONFLICT (id) DO NOTHING;

-- 4. Preguntas frecuentes (FAQs)
INSERT INTO public.faqs (id, question, answer, sort_order) VALUES
('a1244bc9-dc63-462a-82bd-7078557bede8', '¿Puedo comprar online desde esta web?', 'No. Este portal es informativo y está orientado a consulta de catálogo, disponibilidad y solicitud de presupuesto.', 1),
('47534542-bc7f-4045-a040-90a1cf0c5ad5', '¿Cómo accedo a tarifas B2B?', 'La empresa debe registrarse y esperar validación manual. Una vez aprobada, verá su tarifa asignada al iniciar sesión.', 2),
('0ea7f06c-92c3-4e87-a723-46769c64496a', '¿Qué pasa si el ERP cambia precios o artículos?', 'El módulo de importación sincroniza el catálogo local con el fichero exportado por el ERP, actualizando precios y estado.', 3),
('6077ed5a-77d6-4e11-8a85-75eaaf29017d', '¿Puedo guardar favoritos?', 'Sí, los usuarios con sesión B2C o B2B pueden guardar artículos para volver a consultarlos más tarde.', 4),
('71866cae-d018-46ca-be54-34144614f255', '¿La disponibilidad mostrada es stock real?', 'No. La disponibilidad es orientativa. Siempre recomendamos confirmar en tienda antes de desplazarse.', 5)
ON CONFLICT (id) DO NOTHING;

-- 5. Historial de importaciones
INSERT INTO public.import_batches (id, file_name, type, started_at, finished_at, status, total_rows, success_rows, error_rows, error_log) VALUES
('9a475460-e856-4a66-8245-32eacdfc76ae', 'seed-import.csv', 'CSV', '2026-06-21 17:14:48.447+00', '2026-06-21 17:14:48.447+00', 'SUCCESS', 20, 20, 0, '[]'),
('aec8f6e1-d2d5-49bb-8c3a-25f2f48a5977', 'test-import.csv', 'CSV', '2026-06-21 17:15:11.98+00', '2026-06-21 17:15:12.007+00', 'SUCCESS', 1, 1, 0, '[]')
ON CONFLICT (id) DO NOTHING;
