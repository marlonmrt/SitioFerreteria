-- ============================================================
-- BLOQUE 8: Stock, Ofertas B2C y B2B
-- Generado: 2026-06-28T10:30:10.635Z
-- ============================================================

-- 1. Agregar columnas (seguro si ya existen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'stock'
  ) THEN
    ALTER TABLE "articles" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'offer_b2c'
  ) THEN
    ALTER TABLE "articles" ADD COLUMN "offer_b2c" integer DEFAULT 0 NOT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'offer_b2b'
  ) THEN
    ALTER TABLE "articles" ADD COLUMN "offer_b2b" integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 2. Migrar ofertas existentes (si las columnas viejas existen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'has_offer'
  ) THEN
    UPDATE "articles" SET "offer_b2c" = "offer_percentage" WHERE "has_offer" = true AND "offer_target" = 'B2C';
    UPDATE "articles" SET "offer_b2b" = "offer_percentage" WHERE "has_offer" = true AND "offer_target" = 'B2B';
  END IF;
END $$;

-- 3. Eliminar columnas viejas (si existen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'has_offer'
  ) THEN
    ALTER TABLE "articles" DROP COLUMN "has_offer";
    ALTER TABLE "articles" DROP COLUMN "offer_percentage";
    ALTER TABLE "articles" DROP COLUMN "offer_target";
  END IF;
END $$;

-- 4. Actualizar stock y ofertas simulados
-- Basado en datos generados el 2026-06-28
UPDATE "articles" SET "stock" = 5, "offer_b2c" = 15, "offer_b2b" = 24 WHERE "id" = '55ba8612-5990-4640-b842-bdc539c13760';
UPDATE "articles" SET "stock" = 19, "offer_b2c" = 6, "offer_b2b" = 0 WHERE "id" = '0100b2a5-5c94-4c8d-81ca-ad6967be41bb';
UPDATE "articles" SET "stock" = 43, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '2f717373-9802-465c-891d-777e8ddeb9b5';
UPDATE "articles" SET "stock" = 9, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '0d3fe769-2eeb-42b8-964a-7eaf8e086232';
UPDATE "articles" SET "stock" = 8, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '5f01c415-abb4-4ea4-a8b6-9e6efc9dca7d';
UPDATE "articles" SET "stock" = 48, "offer_b2c" = 0, "offer_b2b" = 7 WHERE "id" = '58b50ae7-f7d2-4ac9-94ec-adad66f03258';
UPDATE "articles" SET "stock" = 0, "offer_b2c" = 13, "offer_b2b" = 0 WHERE "id" = 'cb6c0ca5-d44c-4573-94bc-d350256b939c';
UPDATE "articles" SET "stock" = 32, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '46946e04-16de-46b4-8e95-aab86c100831';
UPDATE "articles" SET "stock" = 31, "offer_b2c" = 0, "offer_b2b" = 13 WHERE "id" = '5514079c-a923-4020-9ad9-6d4385005eeb';
UPDATE "articles" SET "stock" = 48, "offer_b2c" = 12, "offer_b2b" = 0 WHERE "id" = '5a96b309-11f5-4e6d-bd67-d0439ba7c5a7';
UPDATE "articles" SET "stock" = 4, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '62112eb2-1012-423a-b700-e81302ee7951';
UPDATE "articles" SET "stock" = 3, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '8e2c722c-7445-4e1f-a0ac-43533e73a7cf';
UPDATE "articles" SET "stock" = 8, "offer_b2c" = 15, "offer_b2b" = 15 WHERE "id" = 'f8225e33-fb3f-4c2d-b955-54223f7f8e83';
UPDATE "articles" SET "stock" = 45, "offer_b2c" = 17, "offer_b2b" = 24 WHERE "id" = 'e98bdae6-e95d-40c0-b2ca-21bc2814df08';
UPDATE "articles" SET "stock" = 31, "offer_b2c" = 0, "offer_b2b" = 23 WHERE "id" = '74ac1218-e725-446a-8665-e236c03398db';
UPDATE "articles" SET "stock" = 32, "offer_b2c" = 0, "offer_b2b" = 6 WHERE "id" = '3ebd6c19-541a-444d-a1b4-eae080e0cab4';
UPDATE "articles" SET "stock" = 33, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '08f9cd30-d84e-44c4-8121-fa9bbd833ce0';
UPDATE "articles" SET "stock" = 19, "offer_b2c" = 26, "offer_b2b" = 0 WHERE "id" = '31addcb6-6438-498a-9595-b30d965dea1c';
UPDATE "articles" SET "stock" = 13, "offer_b2c" = 0, "offer_b2b" = 23 WHERE "id" = 'a5bc2465-3ca6-4109-a8d7-158bed6922ca';
UPDATE "articles" SET "stock" = 6, "offer_b2c" = 8, "offer_b2b" = 0 WHERE "id" = 'b97a1198-db02-4de4-ae7a-a9bdb1b0c30a';
UPDATE "articles" SET "stock" = 24, "offer_b2c" = 10, "offer_b2b" = 0 WHERE "id" = 'ebce58b8-06c0-48ad-b05a-822b40bfd4b1';
UPDATE "articles" SET "stock" = 31, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '60ede51e-ec87-41b3-9b4e-b7de03aba139';
UPDATE "articles" SET "stock" = 7, "offer_b2c" = 13, "offer_b2b" = 0 WHERE "id" = '6fa7eb01-95b4-40bc-aada-16ae604591f7';
UPDATE "articles" SET "stock" = 19, "offer_b2c" = 0, "offer_b2b" = 26 WHERE "id" = 'ded36bac-6b74-437b-90fd-435a82790d35';
UPDATE "articles" SET "stock" = 20, "offer_b2c" = 0, "offer_b2b" = 26 WHERE "id" = '93559630-b834-42b2-ab0f-7a7726cd5235';
UPDATE "articles" SET "stock" = 44, "offer_b2c" = 27, "offer_b2b" = 24 WHERE "id" = 'e472f9f2-0bd3-4ba4-a58a-beec13f217e8';
UPDATE "articles" SET "stock" = 25, "offer_b2c" = 19, "offer_b2b" = 20 WHERE "id" = '50aed1e5-27b0-4df7-aee9-772d8e9f6d83';
UPDATE "articles" SET "stock" = 2, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = 'd60f4dd6-3901-4451-b332-33d028d27d3f';
UPDATE "articles" SET "stock" = 34, "offer_b2c" = 21, "offer_b2b" = 19 WHERE "id" = 'b69bdcbf-388f-4e75-a13b-78eb2a773537';
UPDATE "articles" SET "stock" = 6, "offer_b2c" = 0, "offer_b2b" = 27 WHERE "id" = '85ca1185-1440-4da3-b2e2-303f2e76a472';
UPDATE "articles" SET "stock" = 9, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '93dd0b1b-0e05-4d29-aea9-6f3a12fa074c';
UPDATE "articles" SET "stock" = 50, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '4386b9fe-465a-4edb-bd0e-755cecf3b568';
UPDATE "articles" SET "stock" = 10, "offer_b2c" = 8, "offer_b2b" = 27 WHERE "id" = 'd9866e04-ae95-4a45-8e97-3bd49569e37b';
UPDATE "articles" SET "stock" = 39, "offer_b2c" = 0, "offer_b2b" = 7 WHERE "id" = 'a1145c50-8219-489e-a249-7d301c6f9530';
UPDATE "articles" SET "stock" = 20, "offer_b2c" = 0, "offer_b2b" = 26 WHERE "id" = '62f8d658-901c-4595-9a6a-6be84d6c0b0f';
UPDATE "articles" SET "stock" = 28, "offer_b2c" = 26, "offer_b2b" = 11 WHERE "id" = '680e45a7-f5bb-4262-8692-d95e98c8fcd6';
UPDATE "articles" SET "stock" = 33, "offer_b2c" = 7, "offer_b2b" = 0 WHERE "id" = '3cc7aef5-a5fc-4106-8337-6aa95b9c4a37';
UPDATE "articles" SET "stock" = 35, "offer_b2c" = 0, "offer_b2b" = 29 WHERE "id" = '0c026848-8145-4646-8cc9-8eaebbde9499';
UPDATE "articles" SET "stock" = 19, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '5efa1aa1-f583-4917-a3ad-854d27f09654';
UPDATE "articles" SET "stock" = 27, "offer_b2c" = 0, "offer_b2b" = 20 WHERE "id" = '1d1a5001-89f4-4a77-8f1b-210b808f73c1';
UPDATE "articles" SET "stock" = 41, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '2e8086bd-c82f-48f2-a775-1f66e759ff2a';
UPDATE "articles" SET "stock" = 23, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = 'aa8e1e99-899d-4391-892b-cfc82704b852';
UPDATE "articles" SET "stock" = 20, "offer_b2c" = 10, "offer_b2b" = 0 WHERE "id" = '7aea56a6-c046-45a7-8a7f-4b27884d5e22';
UPDATE "articles" SET "stock" = 8, "offer_b2c" = 7, "offer_b2b" = 0 WHERE "id" = '6a61732a-a62d-473d-b47d-f9d59f202b81';
UPDATE "articles" SET "stock" = 2, "offer_b2c" = 19, "offer_b2b" = 22 WHERE "id" = 'd618e55b-fc53-4c51-9084-094915ba46fd';
UPDATE "articles" SET "stock" = 30, "offer_b2c" = 17, "offer_b2b" = 0 WHERE "id" = '63e299ea-224a-4d80-bed1-70732fa932e5';
UPDATE "articles" SET "stock" = 26, "offer_b2c" = 0, "offer_b2b" = 22 WHERE "id" = '10cbf057-06ee-42ac-a472-300cb4582823';
UPDATE "articles" SET "stock" = 39, "offer_b2c" = 24, "offer_b2b" = 0 WHERE "id" = '6f28e0a7-7ae7-4216-9f88-a6addc3e6bf3';
UPDATE "articles" SET "stock" = 26, "offer_b2c" = 6, "offer_b2b" = 0 WHERE "id" = '1ff5fbdc-02fe-477c-9b18-b2476a3aed11';
UPDATE "articles" SET "stock" = 46, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '2294dcaf-bdaf-4042-b976-4ba101322658';
UPDATE "articles" SET "stock" = 32, "offer_b2c" = 24, "offer_b2b" = 0 WHERE "id" = 'b1080c09-0941-4b14-b7b9-862b3bc1c5f9';
UPDATE "articles" SET "stock" = 18, "offer_b2c" = 0, "offer_b2b" = 28 WHERE "id" = 'a4ff3014-312a-47bf-a4f8-34811b74118d';
UPDATE "articles" SET "stock" = 12, "offer_b2c" = 28, "offer_b2b" = 0 WHERE "id" = '22503b6f-6d30-4b9a-a375-63f46c316db0';
UPDATE "articles" SET "stock" = 28, "offer_b2c" = 30, "offer_b2b" = 0 WHERE "id" = 'b389d6e6-1faa-46f6-9b3c-e1d75caf43d5';
UPDATE "articles" SET "stock" = 37, "offer_b2c" = 7, "offer_b2b" = 6 WHERE "id" = '1c9d8055-6a95-4ac3-815d-97d73192b7ea';
UPDATE "articles" SET "stock" = 50, "offer_b2c" = 11, "offer_b2b" = 0 WHERE "id" = 'db989d9f-e114-4458-a710-518bfe6260da';
UPDATE "articles" SET "stock" = 12, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '29b5977c-2e39-445c-b7c3-11977d949578';
UPDATE "articles" SET "stock" = 45, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '329e61ec-2b3b-4a83-a79f-8e211c2bb338';
UPDATE "articles" SET "stock" = 14, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = 'cdb50e39-8946-41d3-ae55-432eedfd02ef';
UPDATE "articles" SET "stock" = 21, "offer_b2c" = 9, "offer_b2b" = 18 WHERE "id" = 'd65c7bf9-3aa7-4b70-84ba-fbf155acfb1c';
UPDATE "articles" SET "stock" = 42, "offer_b2c" = 27, "offer_b2b" = 0 WHERE "id" = 'fb7c822e-21b4-4b26-9efe-12252e543232';
UPDATE "articles" SET "stock" = 11, "offer_b2c" = 0, "offer_b2b" = 0 WHERE "id" = '7f820f51-39b4-4c4c-a107-fb92b45c4c49';
UPDATE "articles" SET "stock" = 34, "offer_b2c" = 12, "offer_b2b" = 13 WHERE "id" = '71a09b80-a5d4-451a-90e1-13f98f9d207c';
UPDATE "articles" SET "stock" = 11, "offer_b2c" = 0, "offer_b2b" = 14 WHERE "id" = '26ea4e19-b6c7-4422-a05e-ae6dddb34480';
UPDATE "articles" SET "stock" = 26, "offer_b2c" = 9, "offer_b2b" = 0 WHERE "id" = '2f626480-6e29-421c-9253-ca7a4493d0b6';

-- Total artículos actualizados: 65
