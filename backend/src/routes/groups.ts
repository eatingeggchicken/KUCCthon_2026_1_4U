import { Router, Response } from 'express';
import QRCode from 'qrcode';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();

router.use(authenticate);

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// POST /api/groups — 그룹 생성
router.post('/', (req: AuthRequest, res: Response) => {
  const { group_name } = req.body;
  if (!group_name?.trim()) {
    res.status(400).json({ error: 'group_name required' });
    return;
  }

  let invite_code = generateInviteCode();
  // 코드 충돌 시 재생성
  while (db.prepare('SELECT 1 FROM "group" WHERE invite_code = ?').get(invite_code)) {
    invite_code = generateInviteCode();
  }

  const result = db
    .prepare('INSERT INTO "group" (group_name, invite_code, created_by) VALUES (?, ?, ?)')
    .run(group_name.trim(), invite_code, req.user!.user_id) as { lastInsertRowid: number };

  // 생성자도 멤버로 추가
  db.prepare('INSERT INTO group_member (group_id, user_id) VALUES (?, ?)').run(
    result.lastInsertRowid,
    req.user!.user_id
  );

  const group = db
    .prepare('SELECT * FROM "group" WHERE group_id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(group);
});

// POST /api/groups/join — 초대코드로 참여
router.post('/join', (req: AuthRequest, res: Response) => {
  const { invite_code } = req.body;
  if (!invite_code) {
    res.status(400).json({ error: 'invite_code required' });
    return;
  }

  const group = db
    .prepare('SELECT * FROM "group" WHERE invite_code = ?')
    .get(invite_code.toUpperCase()) as { group_id: number; group_name: string } | undefined;

  if (!group) {
    res.status(404).json({ error: 'Invalid invite code' });
    return;
  }

  const existing = db
    .prepare('SELECT 1 FROM group_member WHERE group_id = ? AND user_id = ?')
    .get(group.group_id, req.user!.user_id);

  if (existing) {
    res.status(409).json({ error: 'Already a member' });
    return;
  }

  db.prepare('INSERT INTO group_member (group_id, user_id) VALUES (?, ?)').run(
    group.group_id,
    req.user!.user_id
  );

  res.json({ message: 'Joined successfully', group });
});

// GET /api/groups — 내 그룹 목록
router.get('/', (req: AuthRequest, res: Response) => {
  const groups = db
    .prepare(`
      SELECT g.*,
             (SELECT COUNT(*) FROM group_member WHERE group_id = g.group_id) as member_count
      FROM "group" g
      JOIN group_member gm ON g.group_id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `)
    .all(req.user!.user_id);

  res.json(groups);
});

// GET /api/groups/:group_id/members — 그룹 멤버 목록
router.get('/:group_id/members', (req: AuthRequest, res: Response) => {
  const group_id = Number(req.params.group_id);

  const isMember = db
    .prepare('SELECT 1 FROM group_member WHERE group_id = ? AND user_id = ?')
    .get(group_id, req.user!.user_id);
  if (!isMember) {
    res.status(403).json({ error: 'Not a group member' });
    return;
  }

  const members = db
    .prepare(`
      SELECT u.user_id, u.username, gm.joined_at
      FROM group_member gm
      JOIN user u ON u.user_id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `)
    .all(group_id);

  res.json(members);
});

// GET /api/groups/:invite_code/qr — QR코드 PNG 다운로드
router.get('/:invite_code/qr', async (req: AuthRequest, res: Response) => {
  const { invite_code } = req.params;

  const group = db
    .prepare('SELECT * FROM "group" WHERE invite_code = ?')
    .get(invite_code.toUpperCase()) as { group_name: string } | undefined;

  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }

  const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const joinUrl = `${BASE_URL}/join/${invite_code.toUpperCase()}`;

  const buffer = await QRCode.toBuffer(joinUrl, { width: 300, margin: 2 });

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="invite-${invite_code}.png"`);
  res.send(buffer);
});

export default router;
