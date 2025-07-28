import { redis } from '../../lib/redis';

export default async function handler(req, res) {
  const { uid } = req.query;

  if (!uid) return res.status(400).send("❌ UID missing");

  const points = await redis.get(uid);
  res.send(`📊 اوسني امتیازونه: ${points || 0}`);
} 
