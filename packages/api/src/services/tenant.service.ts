import { db } from '../models/db';

export async function getUserTenants(userId: string) {
  // Replace with actual DB query
  return db.query('SELECT * FROM tenants WHERE owner_id = ?', [userId]);
}

export async function createTenant(userId: string, name: string) {
  // Replace with actual DB insert
  return db.query('INSERT INTO tenants (name, owner_id) VALUES (?, ?) RETURNING *', [name, userId]);
}
