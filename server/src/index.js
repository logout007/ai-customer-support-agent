import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-support-agent';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
