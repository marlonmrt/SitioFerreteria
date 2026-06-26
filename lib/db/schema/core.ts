import {
  type AnyPgColumn,
  boolean,
  doublePrecision,
  integer,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  numeric
} from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", ["B2C", "B2B", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "PENDING", "REJECTED"]);
export const importFileTypeEnum = pgEnum("import_file_type", ["CSV", "XLSX"]);
export const importBatchStatusEnum = pgEnum("import_batch_status", ["PENDING", "SUCCESS", "ERROR"]);
export const infoRequestStatusEnum = pgEnum("info_request_status", ["NEW", "ATTENDED"]);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    legalName: text("legal_name").notNull(),
    taxId: text("tax_id").notNull(),
    contactPhone: text("contact_phone").notNull(),
    priceListCode: text("price_list_code").notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }),
    approvedByUserId: uuid("approved_by_user_id").references(
      (): AnyPgColumn => users.id,
      {
        onDelete: "set null"
      }
    ),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    taxIdUnique: uniqueIndex("companies_tax_id_unique").on(table.taxId)
  })
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    type: userTypeEnum("type").notNull().default("B2C"),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null"
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email)
  })
);

export const families = pgTable(
  "families",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    image: text("image"),
    sortOrder: integer("sort_order").notNull().default(0),
    isManual: boolean("is_manual").notNull().default(false)
  },
  (table) => ({
    slugUnique: uniqueIndex("families_slug_unique").on(table.slug)
  })
);

export const subfamilies = pgTable(
  "subfamilies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isManual: boolean("is_manual").notNull().default(false)
  },
  (table) => ({
    slugUnique: uniqueIndex("subfamilies_slug_unique").on(table.slug)
  })
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    erpCode: text("erp_code").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    brand: text("brand"),
    unit: text("unit").notNull().default("u"),
    subfamilyId: uuid("subfamily_id")
      .notNull()
      .references(() => subfamilies.id, { onDelete: "cascade" }),
    mainImage: text("main_image"),
    isActive: boolean("is_active").notNull().default(true),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: "date" }),
    isManual: boolean("is_manual").notNull().default(false),
    hasOffer: boolean("has_offer").notNull().default(false),
    offerPercentage: integer("offer_percentage").notNull().default(0),
    offerTarget: text("offer_target").notNull().default("B2C")
  },
  (table) => ({
    erpCodeUnique: uniqueIndex("articles_erp_code_unique").on(table.erpCode),
    slugUnique: uniqueIndex("articles_slug_unique").on(table.slug),
    subfamilyIdx: index("articles_subfamily_id_idx").on(table.subfamilyId)
  })
);

export const articleImages = pgTable(
  "article_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0)
  }
);

export const articlePrices = pgTable(
  "article_prices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    priceListCode: text("price_list_code").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    priceListUnique: uniqueIndex("article_prices_article_price_list_unique").on(
      table.articleId,
      table.priceListCode
    )
  })
);

export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  openingHours: text("opening_hours").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull()
});

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.articleId] })
  })
);

export const infoRequests = pgTable(
  "info_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id").references(() => articles.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    storeId: uuid("store_id").references(() => stores.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    status: infoRequestStatusEnum("status").notNull().default("NEW")
  }
);

export const importBatches = pgTable("import_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: text("file_name").notNull(),
  type: importFileTypeEnum("type").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
  status: importBatchStatusEnum("status").notNull().default("PENDING"),
  totalRows: integer("total_rows").notNull().default(0),
  successRows: integer("success_rows").notNull().default(0),
  errorRows: integer("error_rows").notNull().default(0),
  errorLog: text("error_log").notNull().default("[]")
});

export const faqs = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0)
});

export const carouselSlides = pgTable("carousel_slides", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  gradientFrom: text("gradient_from").notNull(),
  gradientVia: text("gradient_via"),
  gradientTo: text("gradient_to").notNull(),
  backgroundImage: text("background_image"),
  textColor: text("text_color").default("#ffffff"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true)
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => menuItems.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull()
});

export type ImportErrorEntry = {
  row: number;
  reason: string;
  details?: string;
};

export const schemaTables = {
  companies,
  users,
  families,
  subfamilies,
  articles,
  articleImages,
  articlePrices,
  stores,
  favorites,
  infoRequests,
  importBatches,
  faqs,
  menuItems,
  carouselSlides
};

export const schemaEnums = {
  userTypeEnum,
  userStatusEnum,
  importFileTypeEnum,
  importBatchStatusEnum,
  infoRequestStatusEnum
};
