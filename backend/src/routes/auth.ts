import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'username and password required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'password must be at least 6 characters' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = db
      .prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)')
      .run(username, passwordHash) as { lastInsertRowid: number };

    const token = jwt.sign(
      { user_id: result.lastInsertRowid, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, username });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'username and password required' });
    return;
  }

  const user = db
    .prepare('SELECT * FROM user WHERE username = ?')
    .get(username) as { user_id: number; username: string; password_hash: string } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { user_id: user.user_id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, username: user.username });
});

export default router;
