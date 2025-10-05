import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import * as chatService from '../services/ai-chat.service.js';
import { db } from '../models/db.js';
import { clientProfiles } from '../models/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

const createSessionSchema = z.object({
  websiteId: z.string().uuid().optional(),
});

const sendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1, 'Bericht mag niet leeg zijn'),
  websiteId: z.string().uuid().optional(),
});

router.post('/sessions', authenticate, validateBody(createSessionSchema), async (req, res) => {
  try {
    // Get client profile for current user
    const [clientProfile] = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, req.user!.userId))
      .limit(1);

    if (!clientProfile) {
      return res.status(404).json({ error: 'Client profiel niet gevonden' });
    }

    const session = await chatService.createChatSession(clientProfile.id, req.body.websiteId);
    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/messages', authenticate, apiLimiter, validateBody(sendMessageSchema), async (req, res) => {
  try {
    const [clientProfile] = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, req.user!.userId))
      .limit(1);

    if (!clientProfile) {
      return res.status(404).json({ error: 'Client profiel niet gevonden' });
    }

    const result = await chatService.sendMessage(
      req.body.sessionId,
      req.body.message,
      clientProfile.id,
      req.body.websiteId
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/sessions', authenticate, async (req, res) => {
  try {
    const [clientProfile] = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, req.user!.userId))
      .limit(1);

    if (!clientProfile) {
      return res.status(404).json({ error: 'Client profiel niet gevonden' });
    }

    const sessions = await chatService.getClientChatSessions(clientProfile.id);
    res.json(sessions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/sessions/:sessionId/messages', authenticate, async (req, res) => {
  try {
    const messages = await chatService.getChatHistory(req.params.sessionId);
    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const escalateSchema = z.object({
  reason: z.string().min(1, 'Reden is verplicht'),
});

router.post('/sessions/:sessionId/escalate', authenticate, validateBody(escalateSchema), async (req, res) => {
  try {
    const result = await chatService.escalateToSupport(req.params.sessionId, req.body.reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
