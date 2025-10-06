import { db } from '../models/db';
import crypto from 'crypto';

export async function createInvite(userId: string, tenantId: string, email: string, role: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  // Replace with actual DB insert
  return db.query(
    'INSERT INTO invites (tenant_id, email, role, token, expires_at) VALUES (?, ?, ?, ?, ?) RETURNING *',
    [tenantId, email, role, token, expiresAt]
  );
}

export async function acceptInvite(token: string) {
  // Replace with actual DB update
  const invite = await db.query('SELECT * FROM invites WHERE token = ? AND expires_at > NOW()', [token]);
  if (!invite) return null;
  // Add user to tenant, then delete invite
  await db.query('DELETE FROM invites WHERE token = ?', [token]);
  return true;
}
