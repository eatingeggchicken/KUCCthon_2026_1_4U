import 'dotenv/config';
import express from 'express';
import path from 'path';
import './db';
import authRouter from './routes/auth';
import groupsRouter from './routes/groups';
import lettersRouter from './routes/letters';

const app = express();

app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/letters', lettersRouter);

// 프로덕션: 빌드된 프론트엔드 서빙
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (_, res) => res.sendFile(path.join(frontendDist, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
