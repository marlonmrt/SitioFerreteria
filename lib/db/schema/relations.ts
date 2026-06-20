import { relations } from "drizzle-orm";

import {
  articleImages,
  articlePrices,
  articles,
  companies,
  favorites,
  families,
  infoRequests,
  stores,
  subfamilies,
  users
} from "./core";

export const companiesRelations = relations(companies, ({ one, many }) => ({
  approvedBy: one(users, {
    fields: [companies.approvedByUserId],
    references: [users.id]
  }),
  users: many(users)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id]
  }),
  favorites: many(favorites),
  infoRequests: many(infoRequests)
}));

export const familiesRelations = relations(families, ({ many }) => ({
  subfamilies: many(subfamilies)
}));

export const subfamiliesRelations = relations(subfamilies, ({ one, many }) => ({
  family: one(families, {
    fields: [subfamilies.familyId],
    references: [families.id]
  }),
  articles: many(articles)
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  subfamily: one(subfamilies, {
    fields: [articles.subfamilyId],
    references: [subfamilies.id]
  }),
  images: many(articleImages),
  prices: many(articlePrices),
  favorites: many(favorites),
  infoRequests: many(infoRequests)
}));

export const articleImagesRelations = relations(articleImages, ({ one }) => ({
  article: one(articles, {
    fields: [articleImages.articleId],
    references: [articles.id]
  })
}));

export const articlePricesRelations = relations(articlePrices, ({ one }) => ({
  article: one(articles, {
    fields: [articlePrices.articleId],
    references: [articles.id]
  })
}));

export const storesRelations = relations(stores, ({ many }) => ({
  infoRequests: many(infoRequests)
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id]
  }),
  article: one(articles, {
    fields: [favorites.articleId],
    references: [articles.id]
  })
}));

export const infoRequestsRelations = relations(infoRequests, ({ one }) => ({
  article: one(articles, {
    fields: [infoRequests.articleId],
    references: [articles.id]
  }),
  user: one(users, {
    fields: [infoRequests.userId],
    references: [users.id]
  }),
  store: one(stores, {
    fields: [infoRequests.storeId],
    references: [stores.id]
  })
}));
