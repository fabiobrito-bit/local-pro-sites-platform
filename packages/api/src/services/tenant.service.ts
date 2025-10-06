import { db } from '../models/db';
import { tenants } from '../models/schema';
import { eq } from 'drizzle-orm';

export async function getUserTenants(userId: string) {
  // Get tenants using drizzle ORM
  return db.select().from(tenants).where(eq(tenants.ownerId, userId)).execute();
}

export async function createTenant(userId: string, name: string) {
  // Create tenant using drizzle ORM
  return db.insert(tenants).values({ name, ownerId: userId }).returning();
}
