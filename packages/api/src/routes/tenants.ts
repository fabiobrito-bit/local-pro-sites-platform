import express from 'express';
import { getUserTenants, createTenant } from '../services/tenant.service';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// GET /api/tenants - List all tenants for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
  if (!req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.userId;
    const tenants = await getUserTenants(userId);
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// POST /api/tenants - Create a new tenant
router.post('/', requireAuth, async (req, res) => {
  try {
  if (!req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.userId;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const tenant = await createTenant(userId, name);
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

export default router;
