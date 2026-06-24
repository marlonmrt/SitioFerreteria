CREATE SCHEMA IF NOT EXISTS drizzle;

TRUNCATE TABLE 
    drizzle.__drizzle_migrations, 
    public.favorites,
    public.info_requests,
    public.article_prices, 
    public.article_images, 
    public.articles, 
    public.subfamilies,
    public.families, 
    public.menu_items,
    public.users, 
    public.companies, 
    public.import_batches, 
    public.stores, 
    public.faqs 
CASCADE;

-- ===== END OF datos_migracion_bloque_1.sql =====

-- 1. Forzar la creación de la tabla de migraciones dentro del esquema drizzle si no existe
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint,
    CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id)
);

-- 2. Insertar los datos del historial de Drizzle
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES 
(1, 'a7e0af4d45457e3a0825b706f7a1b564d8981d19ba7f33c2b0b497ccae70fc46', 1781946706855),
(2, 'e82fd8ec47aee2d5236ff842a9f892f012efa984a9568ee5e9ce69ef44351191', 1781948060901),
(3, '8a79b60858965c4f23304c73cce48800b02db1b1850a8144663e89c5d763cb29', 1781971454223),
(4, 'c50ceec2a7577c9850dc510c12dfe1af24488dc4fa53bc4d5376532a20a912f9', 1782032767584),
(5, '94c165c68ea56af0f9aad8179fc85a1ce60a43832e88caaedffddd2796ee0f85', 1782036705551),
(6, '3a9951097e3f9b104ea3e04a08f9b1d6e2a431b57b5dc428aee65c090b9bceff', 1782061194306)
ON CONFLICT (id) DO NOTHING;

-- 3. Cargar el resto de familias y compañías del bloque 2
INSERT INTO public.families (id, name, slug, image, sort_order, is_manual) VALUES
('ef12fd9c-1b5a-44ca-a14f-92030ce57303', 'Baños', 'banos', '/images/families/banos.jpg', 1, false),
('14c61ba3-f3ca-4e75-89ac-86bc9a2e583c', 'Cerámicas', 'ceramicas', '/images/families/ceramicas.jpg', 2, false),
('061971a6-4202-48d7-8c24-f461c279c8d5', 'Climatización', 'climatizacion', '/images/families/climatizacion.jpg', 3, false),
('fc6572b5-2e4d-4eb7-8c57-83e3a8db11f3', 'Construcción', 'construccion', '/images/families/construccion.jpg', 4, false),
('092a23cb-a79d-41f4-af2a-6cf257694285', 'Hogar y Electrodomésticos', 'hogar-electrodomesticos', '/images/families/hogar-electrodomesticos.jpg', 5, false),
('9af38c8c-285d-4907-978a-4d29cf584113', 'Sellado y Fijación', 'sellado-fijacion', '/images/families/sellado-fijacion.jpg', 6, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.companies (id, legal_name, tax_id, contact_phone, price_list_code, approved_at, approved_by_user_id, created_at) VALUES
('608659ec-c59f-40cc-acb3-930217da4199', 'Construcciones Atlántico SL', 'B12345678', '+34 922 222 222', 'PRO_01', '2026-06-21 17:14:48.423+00', NULL, '2026-06-21 17:14:48.425509+00'),
('739a3ae8-f4d0-40d5-a2a6-42332c6ba1e7', 'construc', 'B1555469', '+34687424074', 'PRO_01', '2026-06-22 11:47:38.339+00', NULL, '2026-06-22 11:47:23.939143+00')
ON CONFLICT (id) DO NOTHING;

-- ===== END OF datos_migracion_bloque_2.sql =====

INSERT INTO public.subfamilies (id, family_id, name, slug, sort_order, is_manual) VALUES
('85c33022-9b04-4074-abc3-fdf2bf3c5448', 'ef12fd9c-1b5a-44ca-a14f-92030ce57303', 'Grifería', 'banos-griferia', 1, false),
('93c0e9c6-c98f-43f5-bd59-bd4595315855', 'ef12fd9c-1b5a-44ca-a14f-92030ce57303', 'Mobiliario', 'banos-mobiliario', 2, false),
('176b67b4-cfe9-4256-8fa0-1b805bedc7cc', 'ef12fd9c-1b5a-44ca-a14f-92030ce57303', 'Sanitarios', 'banos-sanitarios', 3, false),
('9ea4790b-5e04-4da6-a8d4-0c5f465c9aff', '14c61ba3-f3ca-4e75-89ac-86bc9a2e583c', 'Revestimientos', 'ceramicas-revestimientos', 1, false),
('92276ae8-3f9e-4c50-ba44-db294853f588', '14c61ba3-f3ca-4e75-89ac-86bc9a2e583c', 'Pavimentos', 'ceramicas-pavimentos', 2, false),
('b6ad25f8-2e5f-45d8-888f-89f3b2768898', '14c61ba3-f3ca-4e75-89ac-86bc9a2e583c', 'Adhesivos', 'ceramicas-adhesivos', 3, false),
('b17f70cd-da0b-49c7-8974-3b94f043a83b', '061971a6-4202-48d7-8c24-f461c279c8d5', 'Aire acondicionado', 'climatizacion-aire-acondicionado', 1, false),
('d934c3e9-18e4-4a06-91e4-2274a3015749', '061971a6-4202-48d7-8c24-f461c279c8d5', 'Ventilación', 'climatizacion-ventilacion', 2, false),
('79a23b85-faa9-44a9-9c74-6e8ea73d5b5f', '061971a6-4202-48d7-8c24-f461c279c8d5', 'Calefacción', 'climatizacion-calefaccion', 3, false),
('9251a175-2313-41bc-830d-d84e4c395a2c', 'fc6572b5-2e4d-4eb7-8c57-83e3a8db11f3', 'Morteros', 'construccion-morteros', 1, false),
('210cecbe-e37e-439a-b8bd-cdc366c0e2f0', 'fc6572b5-2e4d-4eb7-8c57-83e3a8db11f3', 'Cementos', 'construccion-cementos', 2, false),
('6d1d799b-dc39-4946-ba18-109bc171eec3', 'fc6572b5-2e4d-4eb7-8c57-83e3a8db11f3', 'Herramienta de obra', 'construccion-herramienta-obra', 3, false),
('be06f08f-3371-45ba-b53f-0197eb73aec6', '092a23cb-a79d-41f4-af2a-6cf257694285', 'Cocina', 'hogar-cocina', 1, false),
('892db090-5146-4857-ab9f-8b4551466bfb', '092a23cb-a79d-41f4-af2a-6cf257694285', 'Limpieza', 'hogar-limpieza', 2, false),
('20c1ac2a-8194-45f0-8a2a-f2062584abf3', '092a23cb-a79d-41f4-af2a-6cf257694285', 'Almacenaje', 'hogar-almacenaje', 3, false),
('2b6dd677-6d31-4bde-a6d1-0b46d586d308', '9af38c8c-285d-4907-978a-4d29cf584113', 'Siliconas', 'sellado-siliconas', 1, false),
('c7f6ca8f-5ef1-4734-b43e-d224b7ff69ed', '9af38c8c-285d-4907-978a-4d29cf584113', 'Adhesivos', 'sellado-adhesivos', 2, false),
('2033babd-e0f2-450c-8d1f-69f2d3c0f16a', '9af38c8c-285d-4907-978a-4d29cf584113', 'Fijaciones', 'sellado-fijaciones', 3, false);

INSERT INTO public.users (id, email, password_hash, name, type, status, company_id, created_at) VALUES
('092638b7-dca3-44e6-b807-c49655880122', 'admin@ferreteria.local', '$2b$10$Gc.IFhyzdN61Ey5KiDPR3ey3r2XgHXNBPRFVKVDgvWcPnotdHIjiy', 'Administración', 'ADMIN', 'ACTIVE', NULL, '2026-06-21 17:14:48.422986+00'),
('6d2b3b7c-5ae1-450b-b7cf-4ffc9a6be1b8', 'empresa@atlanticoconstruye.local', '$2b$10$Gc.IFhyzdN61Ey5KiDPR3ey3r2XgHXNBPRFVKVDgvWcPnotdHIjiy', 'Carlos Pérez', 'B2B', 'ACTIVE', '608659ec-c59f-40cc-acb3-930217da4199', '2026-06-21 17:14:48.428098+00'),
('d10cbc4a-b73a-4016-9e26-ebfbca1306ea', 'asd@asd.om', '$2b$10$3LcfCxHRdGoBxg353EOVpOgwH8zYyN.CUxHR8YuFJ3JeExzLGRfLG', 'marlon', 'B2C', 'ACTIVE', NULL, '2026-06-22 11:44:03.785628+00'),
('fdc34d85-a4eb-4a17-a4cf-1829552686c2', 'asdasd@sdsd.ocm', '$2b$10$U1nBFiuUptdJJSmAy2FfJ.SgdTVWighQiOaUc5yy2zyBCA06.4NZW', 'Collares', 'B2C', 'ACTIVE', NULL, '2026-06-22 11:44:25.1456+00'),
('3e850c8e-b393-427e-b01f-f3b8dad4407d', 'revdfsdsd@asdf.com', '$2b$10$OzrlMAnhoGbdXs8A5keyL.8EL2TH1Y217ghWhqAaobXod.uKhqmYq', 'ROBERTO FRÍAS HERNANDEZ', 'B2B', 'ACTIVE', '739a3ae8-f4d0-40d5-a2a6-42332c6ba1e7', '2026-06-22 11:47:23.939143+00');

-- Resolver la relación circular aprobando las compañías ahora que el admin existe
UPDATE public.companies SET approved_by_user_id = '092638b7-dca3-44e6-b807-c49655880122' WHERE id IN ('608659ec-c59f-40cc-acb3-930217da4199', '739a3ae8-f4d0-40d5-a2a6-42332c6ba1e7');

-- ===== END OF datos_migracion_bloque_3.sql =====

INSERT INTO public.articles (id, erp_code, name, slug, description, brand, unit, subfamily_id, main_image, is_active, last_synced_at, is_manual, has_offer, offer_percentage, offer_target) VALUES
('50aed1e5-27b0-4df7-aee9-772d8e9f6d83', 'CLI-VEN-001', 'Extractor de baño silent', 'extractor-bano-silencioso', 'Extractor con bajo nivel sonoro y válvula antirretorno.', 'AirFlow', 'ud', 'd934c3e9-18e4-4a06-91e4-2274a3015749', '/images/articles/extractor-bano.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('e472f9f2-0bd3-4ba4-a58a-beec13f217e8', 'CLI-CAL-001', 'Radiador de aceite 9 elementos', 'radiador-aceite-9-elementos', 'Radiador portátil con termostato regulable.', 'WarmHome', 'ud', '79a23b85-faa9-44a9-9c74-6e8ea73d5b5f', '/images/articles/radiador-aceite.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('a1145c50-8219-489e-a249-7d301c6f9530', 'CON-MOR-001', 'Mortero de reparación rápida', 'mortero-reparacion-rapida', 'Mortero para pequeñas reparaciones y anclajes rápidos.', 'BuildFix', 'saco', '9251a175-2313-41bc-830d-d84e4c395a2c', '/images/articles/mortero-rapido.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('4386b9fe-465a-4edb-bd0e-755cecf3b568', 'CON-CEM-001', 'Cemento portland 25 kg', 'cemento-portland-25kg', 'Cemento para obra general y hormigón de uso habitual.', 'BuildFix', 'saco', '210cecbe-e37e-439a-b8bd-cdc366c0e2f0', '/images/articles/cemento-portland.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('d9866e04-ae95-4a45-8e97-3bd49569e37b', 'CON-HER-001', 'Llana de acero inoxidable', 'llana-acero-inoxidable', 'Llana profesional con mango ergonómico de goma.', 'ProBuild', 'ud', '6d1d799b-dc39-4946-ba18-109bc171eec3', '/images/articles/llana-acero.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('63e299ea-224a-4d80-bed1-70732fa932e5', 'HOG-COC-001', 'Batidora de mano 700W', 'batidora-mano-700w', 'Batidora compacta con velocidad variable y vaso medidor.', 'HomeLab', 'ud', 'be06f08f-3371-45ba-b53f-0197eb73aec6', '/images/articles/batidora-mano.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('10cbf057-06ee-42ac-a472-300cb4582823', 'HOG-LIM-001', 'Aspiradora ciclónica compacta', 'aspiradora-ciclonica-compacta', 'Aspiradora sin bolsa con filtro lavable.', 'HomeLab', 'ud', '892db090-5146-4857-ab9f-8b4551466bfb', '/images/articles/aspiradora-ciclonica.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('d618e55b-fc53-4c51-9084-094915ba46fd', 'HOG-ALM-001', 'Caja organizadora apilable', 'caja-organizadora-apilable', 'Caja transparente con tapa y sistema de apilado.', 'StoreMax', 'ud', '20c1ac2a-8194-45f0-8a2a-f2062584abf3', '/images/articles/caja-organizadora.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('7f820f51-39b4-4c4c-a107-fb92b45c4c49', 'SEL-SIL-001', 'Silicona neutra blanca', 'silicona-neutra-blanca', 'Silicona para sellado multiuso de carpintería y sanitarios.', 'SealPro', 'cartucho', '2b6dd677-6d31-4bde-a6d1-0b46d586d308', '/images/articles/silicona-neutra.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('cdb50e39-8946-41d3-ae55-432eedfd02ef', 'SEL-ADH-001', 'Adhesivo montaje extra fuerte', 'adhesivo-montaje-extra-fuerte', 'Adhesivo de montaje para interiores y acabados rápidos.', 'SealPro', 'cartucho', 'c7f6ca8f-5ef1-4734-b43e-d224b7ff69ed', '/images/articles/adhesivo-montaje.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('d65c7bf9-3aa7-4b70-84ba-fbf155acfb1c', 'SEL-FIJ-001', 'Taco nylon con tornillo 8 mm', 'taco-nylon-con-tornillo-8mm', 'Kit de fijación para pared con alta resistencia.', 'FastFix', 'pack', '2033babd-e0f2-450c-8d1f-69f2d3c0f16a', '/images/articles/taco-tornillo.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('fb7c822e-21b4-4b26-9efe-12252e543232', 'SEL-FIJ-002', 'Anclaje químico 300 ml', 'anclaje-quimico-300ml', 'Anclaje químico para cargas medias y altas.', 'FastFix', 'cartucho', '2033babd-e0f2-450c-8d1f-69f2d3c0f16a', '/images/articles/anclaje-quimico.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('58b50ae7-f7d2-4ac9-94ec-adad66f03258', 'BAN-GRI-001', 'Grifo monomando lavabo cromo', 'grifo-monomando-lavabo-cromo', 'Grifo monomando con cartucho cerámico y acabado cromado.', 'AquaPro', 'ud', '85c33022-9b04-4074-abc3-fdf2bf3c5448', '/images/articles/grifo-lavabo.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('cb6c0ca5-d44c-4573-94bc-d350256b939c', 'BAN-GRI-002', 'Columna de ducha termostática', 'columna-ducha-termostatica', 'Columna con rociador superior y barra regulable.', 'AquaPro', 'ud', '85c33022-9b04-4074-abc3-fdf2bf3c5448', '/images/articles/columna-ducha.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('5514079c-a923-4020-9ad9-6d4385005eeb', 'BAN-MOB-001', 'Mueble bajo lavabo 80 cm', 'mueble-bajo-lavabo-80', 'Mueble suspendido con cierre suave y dos cajones.', 'NordBath', 'ud', '93c0e9c6-c98f-43f5-bd59-bd4595315855', '/images/articles/mueble-lavabo.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('62112eb2-1012-423a-b700-e81302ee7951', 'BAN-SAN-001', 'Inodoro compacto rimless', 'inodoro-compacto-rimless', 'Sanitario de doble descarga y tanque bajo.', 'NordBath', 'ud', '176b67b4-cfe9-4256-8fa0-1b805bedc7cc', '/images/articles/inodoro.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('ded36bac-6b74-437b-90fd-435a82790d35', 'CER-REV-001', 'Azulejo efecto piedra 30x60', 'azulejo-efecto-piedra-30x60', 'Revestimiento porcelánico apto para interior y exterior.', 'StoneLine', 'm2', '9ea4790b-5e04-4da6-a8d4-0c5f465c9aff', '/images/articles/azulejo-piedra.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('6fa7eb01-95b4-40bc-aada-16ae604591f7', 'CER-PAV-001', 'Pavimento porcelánico madera', 'pavimento-porcelanico-madera', 'Acabado madera natural con alta resistencia al desgaste.', 'StoneLine', 'm2', '92276ae8-3f9e-4c50-ba44-db294853f588', '/images/articles/pavimento-madera.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('60ede51e-ec87-41b3-9b4e-b7de03aba139', 'CER-ADH-001', 'Adhesivo cementoso flexible C2TE', 'adhesivo-cementoso-flexible-c2te', 'Mortero cola flexible para cerámica de grandes formatos.', 'FixTile', 'saco', 'b6ad25f8-2e5f-45d8-888f-89f3b2768898', '/images/articles/adhesivo-cementoso.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C'),
('93559630-b834-42b2-ab0f-7a7726cd5235', 'CLI-AC-001', 'Split inverter 2.5 kW', 'split-inverter-2-5kw', 'Equipo eficiente con modo silencioso y control remoto.', 'CoolTech', 'ud', 'b17f70cd-da0b-49c7-8974-3b94f043a83b', '/images/articles/split-inverter.jpg', true, '2026-06-21 17:14:48.421+00', false, false, 0, 'B2C');

-- ===== END OF datos_migracion_bloque_4.sql =====

INSERT INTO public.article_images (id, article_id, url, sort_order) VALUES
('dc08ecbe-3caa-44ec-9d46-ee3f1d92195c', '58b50ae7-f7d2-4ac9-94ec-adad66f03258', '/images/articles/grifo-lavabo.jpg', 0),
('19f381d2-bf3a-4bae-b8c3-e7ea84e5b566', 'cb6c0ca5-d44c-4573-94bc-d350256b939c', '/images/articles/columna-ducha.jpg', 1),
('5d4b4bea-c0c8-4ec6-a3c2-f286dae41fd7', '5514079c-a923-4020-9ad9-6d4385005eeb', '/images/articles/mueble-lavabo.jpg', 2),
('a22363f0-2f36-40da-ae29-8132fafd3fb4', '62112eb2-1012-423a-b700-e81302ee7951', '/images/articles/inodoro.jpg', 3),
('c5d0e5fe-df68-4ed2-968b-7dd42c52ec0f', 'ded36bac-6b74-437b-90fd-435a82790d35', '/images/articles/azulejo-piedra.jpg', 4),
('0bda6439-f272-4632-be37-1309f6327ab7', '6fa7eb01-95b4-40bc-aada-16ae604591f7', '/images/articles/pavimento-madera.jpg', 5),
('4d5396f5-6c63-4627-bb49-d1cab0e4d97f', '60ede51e-ec87-41b3-9b4e-b7de03aba139', '/images/articles/adhesivo-cementoso.jpg', 6),
('d2f61b7b-8cf3-418e-860c-2c975ef5a914', '93559630-b834-42b2-ab0f-7a7726cd5235', '/images/articles/split-inverter.jpg', 7),
('435234b7-bc22-4d37-a640-db7942f3f060', '50aed1e5-27b0-4df7-aee9-772d8e9f6d83', '/images/articles/extractor-bano.jpg', 8),
('88b34bb7-d287-4e83-98ba-5539e5086e83', 'e472f9f2-0bd3-4ba4-a58a-beec13f217e8', '/images/articles/radiador-aceite.jpg', 9),
('27f97359-ad4b-4339-95c4-8d18c160e664', 'a1145c50-8219-489e-a249-7d301c6f9530', '/images/articles/mortero-rapido.jpg', 10),
('d2adf2e7-9566-4b18-91c8-f588dc013e7a', '4386b9fe-465a-4edb-bd0e-755cecf3b568', '/images/articles/cemento-portland.jpg', 11),
('8f5ad40d-09b8-4ca8-a9f7-21de200a6c3c', 'd9866e04-ae95-4a45-8e97-3bd49569e37b', '/images/articles/llana-acero.jpg', 12),
('89ca7713-68a6-44b7-bd97-2a3dddfdac76', '63e299ea-224a-4d80-bed1-70732fa932e5', '/images/articles/batidora-mano.jpg', 13),
('8ca1894a-0448-4a06-a789-5cfa2bfb916a', '10cbf057-06ee-42ac-a472-300cb4582823', '/images/articles/aspiradora-ciclonica.jpg', 14),
('0b785e22-6103-40ac-8a22-00847a95d2e2', 'd618e55b-fc53-4c51-9084-094915ba46fd', '/images/articles/caja-organizadora.jpg', 15),
('f7850f10-bd7f-4dd1-99ed-14bbcef8f07a', '7f820f51-39b4-4c4c-a107-fb92b45c4c49', '/images/articles/silicona-neutra.jpg', 16),
('cc84ddf0-01af-4c4d-8a03-d44908a3aa41', 'cdb50e39-8946-41d3-ae55-432eedfd02ef', '/images/articles/adhesivo-montaje.jpg', 17),
('ddd9f453-893f-4273-a4d2-affc39fbd25f', 'd65c7bf9-3aa7-4b70-84ba-fbf155acfb1c', '/images/articles/taco-tornillo.jpg', 18),
('11d0011a-537f-4166-a6c8-a350b20e70f0', 'fb7c822e-21b4-4b26-9efe-12252e543232', '/images/articles/anclaje-quimico.jpg', 19);

INSERT INTO public.article_prices (id, article_id, price_list_code, price, currency, updated_at) VALUES
('d1dbc81c-40ab-42d4-b457-0e62cecc0a2f', '58b50ae7-f7d2-4ac9-94ec-adad66f03258', 'PUBLIC', 49.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('0b4216a2-9d5b-438a-95da-6b731a0e2629', '58b50ae7-f7d2-4ac9-94ec-adad66f03258', 'PRO_01', 41.50, 'EUR', '2026-06-21 17:14:48.439049+00'),
('5a7e044f-8462-414c-b0b4-db9981c01008', 'cb6c0ca5-d44c-4573-94bc-d350256b939c', 'PUBLIC', 189.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('83e56abc-9d4d-468c-97e2-64934cd94e4e', 'cb6c0ca5-d44c-4573-94bc-d350256b939c', 'PRO_01', 159.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('0dc7de9d-e648-4fba-9f9c-24d4abb453c4', '5514079c-a923-4020-9ad9-6d4385005eeb', 'PUBLIC', 239.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('925f1b07-3b15-4f45-827c-385d8245a99d', '5514079c-a923-4020-9ad9-6d4385005eeb', 'PRO_01', 199.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('1a0a1434-ee1e-4367-a21d-37c0370a2931', '62112eb2-1012-423a-b700-e81302ee7951', 'PUBLIC', 219.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('dacbf0af-0965-4c9a-8fd0-06f3494aa375', '62112eb2-1012-423a-b700-e81302ee7951', 'PRO_01', 182.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('aed8f907-4fe8-42bb-a260-d983a631e873', 'ded36bac-6b74-437b-90fd-435a82790d35', 'PUBLIC', 24.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('03f1214b-caab-476a-9cca-c694a1bce513', 'ded36bac-6b74-437b-90fd-435a82790d35', 'PRO_01', 20.75, 'EUR', '2026-06-21 17:14:48.439049+00'),
('15dcff7c-e41e-45f1-bc03-6ce0437b9073', '6fa7eb01-95b4-40bc-aada-16ae604591f7', 'PUBLIC', 28.50, 'EUR', '2026-06-21 17:14:48.439049+00'),
('6c79dee4-5d03-4db9-9386-22125d428a41', '6fa7eb01-95b4-40bc-aada-16ae604591f7', 'PRO_01', 23.80, 'EUR', '2026-06-21 17:14:48.439049+00'),
('c96411f5-a0d8-4b11-aeba-36486c365be1', '60ede51e-ec87-41b3-9b4e-b7de03aba139', 'PUBLIC', 11.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('5d31b0f0-4125-48a6-987d-c71f1a9e2445', '60ede51e-ec87-41b3-9b4e-b7de03aba139', 'PRO_01', 9.80, 'EUR', '2026-06-21 17:14:48.439049+00'),
('9f406b4e-70b2-469a-97a9-b4ac738d06d6', '93559630-b834-42b2-ab0f-7a7726cd5235', 'PUBLIC', 499.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('8d87aa77-d697-4f8c-93c1-1ae692fdc717', '93559630-b834-42b2-ab0f-7a7726cd5235', 'PRO_01', 429.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('eb486574-449e-4899-add0-b6b54a991bfb', '50aed1e5-27b0-4df7-aee9-772d8e9f6d83', 'PUBLIC', 39.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('2e38195d-2ad8-46db-96e8-23fb5fa9ce25', '50aed1e5-27b0-4df7-aee9-772d8e9f6d83', 'PRO_01', 32.50, 'EUR', '2026-06-21 17:14:48.439049+00'),
('71efd884-79d9-45f1-886a-d4d963a353a2', 'e472f9f2-0bd3-4ba4-a58a-beec13f217e8', 'PUBLIC', 79.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('ad531c2a-e325-4896-a7c9-df958990afc7', 'e472f9f2-0bd3-4ba4-a58a-beec13f217e8', 'PRO_01', 67.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('3db9d572-a3b3-4a50-96ef-b70012372f1f', 'a1145c50-8219-489e-a249-7d301c6f9530', 'PUBLIC', 7.95, 'EUR', '2026-06-21 17:14:48.439049+00'),
('9db8d30d-6333-47ba-b0a1-f8a78b22cb25', 'a1145c50-8219-489e-a249-7d301c6f9530', 'PRO_01', 6.50, 'EUR', '2026-06-21 17:14:48.439049+00'),
('0418aa04-9cca-436c-8fe4-4c88ae790949', '4386b9fe-465a-4edb-bd0e-755cecf3b568', 'PUBLIC', 5.40, 'EUR', '2026-06-21 17:14:48.439049+00'),
('17d5ec9a-1b5e-4db0-96cb-1608954087ae', '4386b9fe-465a-4edb-bd0e-755cecf3b568', 'PRO_01', 4.60, 'EUR', '2026-06-21 17:14:48.439049+00'),
('e8b8ac63-955c-4719-8172-b8589bc89fe8', 'd9866e04-ae95-4a45-8e97-3bd49569e37b', 'PUBLIC', 16.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('d393aa45-be3a-463d-b763-f2fa76f73916', 'd9866e04-ae95-4a45-8e97-3bd49569e37b', 'PRO_01', 13.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('f0ed8476-d312-40b3-9bb9-3413636dbc4a', '63e299ea-224a-4d80-bed1-70732fa932e5', 'PUBLIC', 29.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('9cfe10d0-12e9-40d5-bfe9-2eb7a3ec9219', '63e299ea-224a-4d80-bed1-70732fa932e5', 'PRO_01', 24.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('218c4df7-5366-444c-beee-fed00ae38f7a', '10cbf057-06ee-42ac-a472-300cb4582823', 'PUBLIC', 89.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('0b1739ea-7554-4f4a-b2f2-0731b3719e99', '10cbf057-06ee-42ac-a472-300cb4582823', 'PRO_01', 74.00, 'EUR', '2026-06-21 17:14:48.439049+00'),
('59044d4f-372d-4002-aab7-7ebeb07fb1eb', 'd618e55b-fc53-4c51-9084-094915ba46fd', 'PUBLIC', 8.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('b60f99f5-fbba-44e0-98d9-5684b1c9680d', 'd618e55b-fc53-4c51-9084-094915ba46fd', 'PRO_01', 7.20, 'EUR', '2026-06-21 17:14:48.439049+00'),
('42f34f8b-08a9-436d-9b7c-b56f0f0e308f', '7f820f51-39b4-4c4c-a107-fb92b45c4c49', 'PUBLIC', 4.80, 'EUR', '2026-06-21 17:14:48.439049+00'),
('6436b790-42e8-4bd2-a9d1-494b6b3290ce', '7f820f51-39b4-4c4c-a107-fb92b45c4c49', 'PRO_01', 3.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('cb8c6941-a55e-4638-ba52-b54393aad913', 'cdb50e39-8946-41d3-ae55-432eedfd02ef', 'PUBLIC', 6.50, 'EUR', '2026-06-21 17:14:48.439049+00'),
('8304aa2e-865b-46a7-a1ea-9190e53a7868', 'cdb50e39-8946-41d3-ae55-432eedfd02ef', 'PRO_01', 5.40, 'EUR', '2026-06-21 17:14:48.439049+00'),
('b9693bf0-b41f-4f2d-8c6d-c5d91804759e', 'd65c7bf9-3aa7-4b70-84ba-fbf155acfb1c', 'PUBLIC', 9.40, 'EUR', '2026-06-21 17:14:48.439049+00'),
('f6997362-d2be-46b3-975c-9dd80b19f8ff', 'd65c7bf9-3aa7-4b70-84ba-fbf155acfb1c', 'PRO_01', 7.70, 'EUR', '2026-06-21 17:14:48.439049+00'),
('f5afef75-950f-4ed0-a703-dd7d48a2f76d', 'fb7c822e-21b4-4b26-9efe-12252e543232', 'PUBLIC', 14.90, 'EUR', '2026-06-21 17:14:48.439049+00'),
('35c92389-b591-45c0-9dc5-457436ecb40b', 'fb7c822e-21b4-4b26-9efe-12252e543232', 'PRO_01', 12.10, 'EUR', '2026-06-21 17:14:48.439049+00');

-- ===== END OF datos_migracion_bloque_5.sql =====

INSERT INTO public.favorites (user_id, article_id, created_at) VALUES
('6d2b3b7c-5ae1-450b-b7cf-4ffc9a6be1b8', '58b50ae7-f7d2-4ac9-94ec-adad66f03258', '2026-06-21 17:14:48.450506+00'),
('092638b7-dca3-44e6-b807-c49655880122', 'a1145c50-8219-489e-a249-7d301c6f9530', '2026-06-23 01:08:11.456276+00');

INSERT INTO public.info_requests (id, article_id, user_id, name, email, phone, message, store_id, created_at, status) VALUES
('8b9fbfe4-3a2d-4e1d-ad3d-2b8ee29f26b4', 'cb6c0ca5-d44c-4573-94bc-d350256b939c', '6d2b3b7c-5ae1-450b-b7cf-4ffc9a6be1b8', 'Laura Gómez', 'laura.gomez@example.com', '+34 600 000 000', 'Quiero confirmar disponibilidad de varios artículos para una reforma.', '48c22661-cb17-4f02-852a-8efc78960ea6', '2026-06-21 17:14:48.452464+00', 'NEW'),
('4599610a-ce4e-4aa8-90b3-3d0b876ea3e4', '93559630-b834-42b2-ab0f-7a7726cd5235', NULL, 'MARLON RODRIGUEZ TOLEDO', 'Marlon.mrt@gmail.com', '+34619494251', 'Hola, me gustaría solicitar información y presupuesto sobre el artículo "Split inverter 2.5 kW" (Referencia: CLI-AC-001). Quedo a la espera de sus comentarios.', '48c22661-cb17-4f02-852a-8efc78960ea6', '2026-06-22 11:37:47.708094+00', 'NEW');

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 6, true);

-- ===== END OF datos_migracion_bloque_6.sql =====



-- ============================================================
-- Bloque 7: Datos restantes (menÃºs, tiendas, FAQs, import_batches)
-- ============================================================
-- Este bloque completa las tablas que NO se incluyeron en
-- los bloques 1-6: menu_items, stores, faqs, import_batches.
-- Ejecutar DESPUÃ‰S de haber migrado el esquema (drizzle-kit) y
-- los bloques 1-6.

-- 1. MenÃº del sitio (nodos padre primero para respetar FK circular)
INSERT INTO public.menu_items (id, label, href, parent_id, sort_order, is_active, created_at) VALUES
('2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 'Productos', '/articulos', NULL, 0, true, '2026-06-21 14:55:02.996985+00'),
('2e1f92c8-6e2d-465b-979c-844a19259bbd', 'Ofertas', '/articulos', NULL, 0, true, '2026-06-21 09:08:49.046071+00'),
('798dfc02-e56d-439b-b756-244f66a0b00e', 'ConÃ³cenos', '/conocenos', NULL, 1, true, '2026-06-21 09:46:50.941755+00'),
('6415daa1-b824-41c8-b058-e417b29eb29d', 'Contacto', '/contacto', NULL, 2, true, '2026-06-21 09:46:56.922366+00'),
('0e17eba9-afce-4fc1-96b0-0081f46b2f10', 'Tiendas', '/tiendas', NULL, 3, true, '2026-06-21 09:37:14.718903+00')
ON CONFLICT (id) DO NOTHING;

-- 2. Sub-elementos del menÃº (dependen de los padres anteriores)
INSERT INTO public.menu_items (id, label, href, parent_id, sort_order, is_active, created_at) VALUES
('93f53d6e-b150-4d4e-9d02-9e6b03a86ec6', 'BaÃ±os', '/familias/banos', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:55:20.715998+00'),
('2741e951-f98c-4a38-887b-ead51181c4d4', 'CerÃ¡micas', '/familias/ceramicas', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:55:52.565683+00'),
('bddc8158-af25-4fa3-b1ab-aa502ba6a346', 'ConstrucciÃ³n', '/familias/construccion', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:56:08.801921+00'),
('b10e8be4-585b-48e3-a74e-6874bbb2be1e', 'Hogar y ElectrodomÃ©sticos', '/familias/hogar-electrodomesticos', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:56:15.737391+00'),
('3704ce43-59bd-42fc-b1fb-5d73b9301f96', 'Sellado y FijaciÃ³n', '/familias/sellado-fijacion', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 14:56:27.022611+00'),
('6661dc36-20f3-4174-8ab4-fc78526b7da0', 'ClimatizaciÃ³n', '/familias/climatizacion', '2de4dd41-99da-4d93-9bfc-acc5fa2110fa', 0, true, '2026-06-21 15:02:35.418782+00')
ON CONFLICT (id) DO NOTHING;

-- 3. Tiendas
INSERT INTO public.stores (id, name, address, phone, opening_hours, lat, lng) VALUES
('48c22661-cb17-4f02-852a-8efc78960ea6', 'Tienda Central', 'C/ Principal 123, Santa Cruz de Tenerife', '+34 922 000 000', 'L-V 08:00-19:00 | S 09:00-13:00', 28.4636, -16.2518),
('5bbf35cd-416b-4076-ba1c-05ee1f01d0bf', 'Sucursal Sur', 'Av. Comercio 45, Adeje', '+34 922 111 111', 'L-V 08:30-18:30 | S 09:00-13:00', 28.1227, -16.7245)
ON CONFLICT (id) DO NOTHING;

-- 4. Preguntas frecuentes (FAQs)
INSERT INTO public.faqs (id, question, answer, sort_order) VALUES
('a1244bc9-dc63-462a-82bd-7078557bede8', 'Â¿Puedo comprar online desde esta web?', 'No. Este portal es informativo y estÃ¡ orientado a consulta de catÃ¡logo, disponibilidad y solicitud de presupuesto.', 1),
('47534542-bc7f-4045-a040-90a1cf0c5ad5', 'Â¿CÃ³mo accedo a tarifas B2B?', 'La empresa debe registrarse y esperar validaciÃ³n manual. Una vez aprobada, verÃ¡ su tarifa asignada al iniciar sesiÃ³n.', 2),
('0ea7f06c-92c3-4e87-a723-46769c64496a', 'Â¿QuÃ© pasa si el ERP cambia precios o artÃ­culos?', 'El mÃ³dulo de importaciÃ³n sincroniza el catÃ¡logo local con el fichero exportado por el ERP, actualizando precios y estado.', 3),
('6077ed5a-77d6-4e11-8a85-75eaaf29017d', 'Â¿Puedo guardar favoritos?', 'SÃ­, los usuarios con sesiÃ³n B2C o B2B pueden guardar artÃ­culos para volver a consultarlos mÃ¡s tarde.', 4),
('71866cae-d018-46ca-be54-34144614f255', 'Â¿La disponibilidad mostrada es stock real?', 'No. La disponibilidad es orientativa. Siempre recomendamos confirmar en tienda antes de desplazarse.', 5)
ON CONFLICT (id) DO NOTHING;

-- 5. Historial de importaciones
INSERT INTO public.import_batches (id, file_name, type, started_at, finished_at, status, total_rows, success_rows, error_rows, error_log) VALUES
('9a475460-e856-4a66-8245-32eacdfc76ae', 'seed-import.csv', 'CSV', '2026-06-21 17:14:48.447+00', '2026-06-21 17:14:48.447+00', 'SUCCESS', 20, 20, 0, '[]'),
('aec8f6e1-d2d5-49bb-8c3a-25f2f48a5977', 'test-import.csv', 'CSV', '2026-06-21 17:15:11.98+00', '2026-06-21 17:15:12.007+00', 'SUCCESS', 1, 1, 0, '[]')
ON CONFLICT (id) DO NOTHING;

