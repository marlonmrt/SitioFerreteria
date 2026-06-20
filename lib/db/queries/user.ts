import { db } from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email)
  });
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id)
  });
}
