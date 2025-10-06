import { db } from '../models/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { invites } from '../models/schema';

export async function createInvite(userId: string, tenantId: string, email: string, role: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  // Insert invite using drizzle ORM
  return db.insert(invites).values({
    tenantId,
    email,
    role,
    token,
    expiresAt,
  }).returning();
}

export async function acceptInvite(token: string) {
  // Find invite using drizzle ORM
  const invite = await db.select().from(invites).where(eq(invites.token, token)).execute();
  if (!invite.length) return null;
  // Add user to tenant, then delete invite (pseudo)
  await db.delete(invites).where(eq(invites.token, token));
  return true;
}
