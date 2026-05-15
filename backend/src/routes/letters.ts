import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();
router.use(authenticate);

// POST /api/letters/groups/:group_id — 편지 보내기 (익명)
router.post('/groups/:group_id', (req: AuthRequest, res: Response) => {
  const group_id = Number(req.params.group_id);
  const { receiver_id, content } = req.body;

  if (!receiver_id || !content?.trim()) {
    res.status(400).json({ error: 'receiver_id and content required' });
    return;
  }

  const isMember = db
    .prepare('SELECT 1 FROM group_member WHERE group_id = ? AND user_id = ?')
    .get(group_id, req.user!.user_id);
  if (!isMember) {
    res.status(403).json({ error: 'Not a group member' });
    return;
  }

  const receiverMember = db
    .prepare('SELECT 1 FROM group_member WHERE group_id = ? AND user_id = ?')
    .get(group_id, Number(receiver_id));
  if (!receiverMember) {
    res.status(400).json({ error: 'Receiver is not a group member' });
    return;
  }

  const result = db
    .prepare(`
      INSERT INTO letter (group_id, sender_id, receiver_id, content, open_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `)
    .run(group_id, req.user!.user_id, Number(receiver_id), content.trim()) as {
    lastInsertRowid: number;
  };

  res.status(201).json({ letter_id: result.lastInsertRowid });
});

// GET /api/letters/inbox — 받은 편지함 (sender 익명)
router.get('/inbox', (req: AuthRequest, res: Response) => {
  const letters = db
    .prepare(`
      SELECT letter_id, group_id, content, created_at, opened_at, status
      FROM letter
      WHERE receiver_id = ?
      ORDER BY created_at DESC
    `)
    .all(req.user!.user_id);

  // 열리지 않은 편지는 내용 숨김
  const result = (letters as any[]).map((l) => ({
    letter_id: l.letter_id,
    group_id: l.group_id,
    content: l.status === 'opened' ? l.content : null,
    created_at: l.created_at,
    opened_at: l.opened_at,
    status: l.status,
  }));

  res.json(result);
});

// GET /api/letters/outbox — 보낸 편지함
router.get('/outbox', (req: AuthRequest, res: Response) => {
  const letters = db
    .prepare(`
      SELECT l.letter_id, l.group_id, l.receiver_id, u.username as receiver_username,
             l.content, l.created_at, l.open_at, l.opened_at, l.status
      FROM letter l
      JOIN user u ON u.user_id = l.receiver_id
      WHERE l.sender_id = ?
      ORDER BY l.created_at DESC
    `)
    .all(req.user!.user_id);

  res.json(letters);
});

// GET /api/letters/today-status — 오늘 발송/열기 현황
router.get('/today-status', (req: AuthRequest, res: Response) => {
  const { cnt: sent_today } = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM letter WHERE sender_id = ? AND DATE(created_at) = DATE('now')`
    )
    .get(req.user!.user_id) as { cnt: number };

  const { cnt: opened_today } = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM letter WHERE receiver_id = ? AND DATE(opened_at) = DATE('now')`
    )
    .get(req.user!.user_id) as { cnt: number };

  res.json({
    sent_today,
    opened_today,
    can_open: Math.max(0, sent_today - opened_today),
  });
});

// POST /api/letters/:letter_id/open — 편지 열기
router.post('/:letter_id/open', (req: AuthRequest, res: Response) => {
  const letter_id = Number(req.params.letter_id);

  const letter = db
    .prepare('SELECT * FROM letter WHERE letter_id = ?')
    .get(letter_id) as any;

  if (!letter) {
    res.status(404).json({ error: 'Letter not found' });
    return;
  }

  if (letter.receiver_id !== req.user!.user_id) {
    res.status(403).json({ error: 'Not your letter' });
    return;
  }

  if (letter.status === 'opened') {
    res.status(409).json({ error: 'Already opened' });
    return;
  }

  // 오늘 보낸 편지 수만큼만 열 수 있음
  const { cnt: sent_today } = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM letter WHERE sender_id = ? AND DATE(created_at) = DATE('now')`
    )
    .get(req.user!.user_id) as { cnt: number };

  const { cnt: opened_today } = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM letter WHERE receiver_id = ? AND DATE(opened_at) = DATE('now')`
    )
    .get(req.user!.user_id) as { cnt: number };

  if (sent_today === 0) {
    res.status(403).json({
      error: 'Write a letter today to open one',
      sent_today,
      can_open: 0,
    });
    return;
  }

  if (opened_today >= sent_today) {
    res.status(403).json({
      error: 'No opens left today. Write more letters to open more.',
      sent_today,
      opened_today,
      can_open: 0,
    });
    return;
  }

  db.prepare(
    `UPDATE letter SET status = 'opened', opened_at = datetime('now') WHERE letter_id = ?`
  ).run(letter_id);

  const updated = db.prepare('SELECT * FROM letter WHERE letter_id = ?').get(letter_id) as any;

  // 익명: sender_id 제거
  const { sender_id: _, ...response } = updated;
  res.json(response);
});

export default router;
