import express from 'express';
import { createInvite, acceptInvite } from '../services/invite.service';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// POST /api/invites - Create an invite
router.post('/', requireAuth, async (req, res) => {
  try {
    const { tenantId, email, role } = req.body;
    if (!tenantId || !email || !role) return res.status(400).json({ error: 'Missing fields' });
  if (!req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const invite = await createInvite(req.user.userId, tenantId, email, role);
    res.status(201).json(invite);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// POST /api/invites/accept - Accept an invite
router.post('/accept', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const result = await acceptInvite(token);
    if (!result) return res.status(400).json({ error: 'Invalid or expired token' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

export default router;
