import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 karakters zijn'),
  firstName: z.string().min(1, 'Voornaam is verplicht'),
  lastName: z.string().min(1, 'Achternaam is verplicht'),
  businessName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  totpToken: z.string().optional(),
});

router.post('/register', authLimiter, validateBody(registerSchema), async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: 'Registratie succesvol', user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
  try {
    const result = await authService.loginUser(req.body.email, req.body.password, req.body.totpToken);

    if ('requiresTwoFa' in result && result.requiresTwoFa) {
      return res.json({ requiresTwoFa: true });
    }

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ user: result.user, token: result.token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    await authService.logout(token!);
    res.clearCookie('token');
    res.json({ message: 'Uitgelogd' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// 2FA Routes
router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    const result = await authService.setupTwoFa(req.user!.userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const enable2faSchema = z.object({
  token: z.string().length(6, '2FA code moet 6 cijfers zijn'),
});

router.post('/2fa/enable', authenticate, validateBody(enable2faSchema), async (req, res) => {
  try {
    const result = await authService.enableTwoFa(req.user!.userId, req.body.token);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/2fa/disable', authenticate, async (req, res) => {
  try {
    const result = await authService.disableTwoFa(req.user!.userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
