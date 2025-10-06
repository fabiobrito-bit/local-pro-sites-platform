import { Router } from 'express';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/resend.service';
import { db } from '../models/db';
import { users } from '../models/schema';
import crypto from 'crypto';

const router = Router();

// POST /auth/send-verification
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  // Save token to user in DB (pseudo)
  await db.update(users).set({ verification_token: token }).where(users.email.eq(email));
  await sendVerificationEmail(email, token);
  res.json({ success: true });
});

// POST /auth/verify-email
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  // Find user by token and verify
  const user = await db.select().from(users).where(users.verification_token.eq(token)).execute();
  if (!user.length) return res.status(400).json({ success: false, message: 'Invalid token' });
  await db.update(users).set({ is_verified: true, verification_token: null }).where(users.verification_token.eq(token));
  res.json({ success: true });
});

// POST /auth/request-password-reset
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  // Save token to user in DB (pseudo)
  await db.update(users).set({ reset_token: token }).where(users.email.eq(email));
  await sendPasswordResetEmail(email, token);
  res.json({ success: true });
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  // Find user by token and reset password
  const user = await db.select().from(users).where(users.reset_token.eq(token)).execute();
  if (!user.length) return res.status(400).json({ success: false, message: 'Invalid token' });
  // Hash password (pseudo)
  const hashed = crypto.createHash('sha256').update(password).digest('hex');
  await db.update(users).set({ password: hashed, reset_token: null }).where(users.reset_token.eq(token));
  res.json({ success: true });
});

export default router;
