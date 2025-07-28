import { redis } from '../../lib/redis';

export default async function handler(req, res) {
  const { uid, points } = req.query;

  if (!uid || !points) return res.status(400).send("❌ UID or Points missing");

  await redis.incrby(uid, parseInt(points));

  res.send(`✅ ${points} امتیازونه ${uid} ته زیات شول`);
} 
