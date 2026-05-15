import 'dotenv/config';
import express from 'express';
import './db';
import authRouter from './routes/auth';
import groupsRouter from './routes/groups';

const app = express();

app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/groups', groupsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
