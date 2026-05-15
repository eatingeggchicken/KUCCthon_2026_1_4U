import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const group_id = Number(req.query.group_id);
  if (!group_id) { res.status(400).json({ error: 'group_id required' }); return; }
  const entries = db.prepare(`
    SELECT diary_id, group_id, content, mood, created_at
    FROM diary
    WHERE user_id = ? AND group_id = ?
    ORDER BY created_at DESC
  `).all(req.user!.user_id, group_id);
  res.json(entries);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const { group_id, content, mood = '😊' } = req.body;
  if (!group_id || !content?.trim()) {
    res.status(400).json({ error: 'group_id and content required' }); return;
  }
  const result = db.prepare(
    'INSERT INTO diary (user_id, group_id, content, mood) VALUES (?, ?, ?, ?)'
  ).run(req.user!.user_id, Number(group_id), content.trim(), mood);
  res.json({ diary_id: result.lastInsertRowid });
});

export default router;
