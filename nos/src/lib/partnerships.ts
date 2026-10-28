import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { partnershipRequests } from "./db/schema";

export type PartnershipInput = {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  instagram?: string | null;
  idea: string;
};

export async function createPartnershipRequest(input: PartnershipInput) {
  const clean = (v?: string | null) => v?.trim() || null;
  await db.insert(partnershipRequests).values({
    name: input.name.trim(),
    company: clean(input.company),
    email: input.email.trim().toLowerCase(),
    phone: clean(input.phone),
    instagram: clean(input.instagram)?.replace(/^@/, "") ?? null,
    idea: input.idea.trim(),
  });
}

export async function listPartnershipRequests() {
  return db.select().from(partnershipRequests).orderBy(desc(partnershipRequests.createdAt));
}

export async function setPartnershipAnswered(id: string, answered: boolean) {
  await db.update(partnershipRequests).set({ answered }).where(eq(partnershipRequests.id, id));
}
