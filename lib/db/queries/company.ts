import { db } from "../index";
import { users, companies } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getPendingB2bRequests() {
  return db.query.users.findMany({
    where: and(eq(users.status, "PENDING"), eq(users.type, "B2B")),
    with: {
      company: true
    }
  });
}

export async function getCompanyPriceListCode(companyId: string): Promise<string> {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId)
  });
  return company?.priceListCode || "PUBLIC";
}
