import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import requireAuth from '../middleware/auth.js';
import Message from '../models/Message.js';
import { getAiReply } from '../utils/aiClient.js';

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many messages, slow down.' },
  keyGenerator: (req) => req.userId,
});

router.use(requireAuth);

router.post('/send', chatLimiter, async (req, res) => {
  const { message } = req.body;
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message is too long (max 2000 characters)' });
  }

  let reply;
  try {
    reply = await getAiReply(message);
  } catch (err) {
    console.error('AI provider failed:', err);
    return res.status(502).json({ error: 'AI provider error' });
  }

  try {
    const saved = await Message.create({ userId: req.userId, message, reply });
    res.json({ message: saved.message, reply: saved.reply, createdAt: saved.createdAt });
  } catch (err) {
    console.error('Saving message failed:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await Message.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json(history.map((m) => ({
      message: m.message,
      reply: m.reply,
      createdAt: m.createdAt,
    })));
  } catch (err) {
    console.error('Fetching history failed:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
