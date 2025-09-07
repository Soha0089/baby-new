const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "tt",
    version: "1.1",
    author: "RL",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Pair two random group members" },
    description: { en: "Show two members with romantic background and love stats" },
    category: "fun",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, usersData, threadsData, message }) {
    const threadInfo = await threadsData.get(event.threadID);
    const members = threadInfo.members.filter(m => m.inGroup);
    if (members.length < 2) return message.reply("❌ Not enough members to pair.");

    const [user1, user2] = getTwoRandom(members);
    const info1 = await usersData.get(user1.userID);
    const info2 = await usersData.get(user2.userID);

    const love = getRandomPercent();
    const comfort = getRandomPercent();

    const avatar1URL = `https://graph.facebook.com/${user1.userID}/picture?width=512&height=512`;
    const avatar2URL = `https://graph.facebook.com/${user2.userID}/picture?width=512&height=512`;

    const assetsDir = path.join(__dirname, "assets");
    const bgPath = path.join(assetsDir, "romantic_bg.jpg");

    // Base64 romantic background from image_gen tool
    const romanticBase64 = `data:image/jpeg;base64,/9j/...YOUR_BASE64_STRING...`;

    // Ensure background image exists
    if (!fs.existsSync(bgPath)) {
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
      const base64Data = romanticBase64.replace(/^data:image\/jpeg;base64,/, "");
      fs.writeFileSync(bgPath, base64Data, 'base64');
    }

    try {
      const [av1Buffer, av2Buffer] = await Promise.all([
        axios.get(avatar1URL, { responseType: "arraybuffer" }),
        axios.get(avatar2URL, { responseType: "arraybuffer" })
      ]);

      const [bg, av1, av2] = await Promise.all([
        loadImage(bgPath),
        loadImage(av1Buffer.data),
        loadImage(av2Buffer.data)
      ]);

      const canvas = createCanvas(800, 500);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, 800, 500);
      drawCircle(ctx, av1, 160, 120, 100);
      drawCircle(ctx, av2, 520, 120, 100);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.fillText(`❤️ Love: ${love}%`, 300, 370);
      ctx.fillText(`💖 Comfort: ${comfort}%`, 300, 420);

      const filePath = path.join(__dirname, "temp", `pair_${Date.now()}.png`);
      if (!fs.existsSync(path.join(__dirname, "temp"))) fs.mkdirSync(path.join(__dirname, "temp"));

      const buffer = canvas.toBuffer();
      fs.writeFileSync(filePath, buffer);

      message.reply({
        body: `${info1.name} 💞 ${info2.name}`,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error("pair.js error:", err);
      message.reply("❌ Something went wrong while generating the pair image.");
    }
  }
};

function getTwoRandom(arr) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function getRandomPercent() {
  return Math.floor(Math.random() * 51) + 50;
}

function drawCircle(ctx, img, x, y, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, radius * 2, radius * 2);
  ctx.restore();
}