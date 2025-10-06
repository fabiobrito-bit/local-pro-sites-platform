import { Router } from 'express';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/resend.service';
import { db } from '../models/db';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { blacklistToken } from '../utils/jwtBlacklist';

const router = Router();

// POST /auth/logout
router.post('/logout', (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(400).json({ success: false, message: 'No token provided' });
  blacklistToken(token);
  res.json({ success: true, message: 'Logged out' });
});

// POST /auth/send-verification
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  // Save token to user in DB (pseudo)
  await db.update(users).set({ verificationToken: token }).where(eq(users.email, email));
  await sendVerificationEmail(email, token);
  res.json({ success: true });
});

// POST /auth/verify-email
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  // Find user by token and verify
  const user = await db.select().from(users).where(eq(users.verificationToken, token)).execute();
  if (!user.length) return res.status(400).json({ success: false, message: 'Invalid token' });
  await db.update(users).set({ isVerified: true, verificationToken: null }).where(eq(users.verificationToken, token));
  res.json({ success: true });
});

// POST /auth/request-password-reset
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  // Save token to user in DB (pseudo)
  await db.update(users).set({ resetToken: token }).where(eq(users.email, email));
  await sendPasswordResetEmail(email, token);
  res.json({ success: true });
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  // Find user by token and reset password
  const user = await db.select().from(users).where(eq(users.resetToken, token)).execute();
  if (!user.length) return res.status(400).json({ success: false, message: 'Invalid token' });
  // Hash password (pseudo)
  const hashed = crypto.createHash('sha256').update(password).digest('hex');
  await db.update(users).set({ passwordHash: hashed, resetToken: null }).where(eq(users.resetToken, token));
  res.json({ success: true });
});

export default router;
