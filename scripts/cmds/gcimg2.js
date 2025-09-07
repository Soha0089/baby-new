const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gcimg2",
    version: "3.6",
    author: "Mahmud x Dipto",
    countDown: 5,
    role: 0,
    description: "Generate group image with members (with background fix)",
    category: "IMAGE",
    guide: "{pn} --bgimg [URL] --color [title] --admincolor [border admin] --membercolor [border member] --namecolor [group name]"
  },

  onStart: async function ({ api, args, event, message }) {
    try {
      let bgImgURL = "https://i.imgur.com/WsY1m2Y.jpeg";
      let titleColor = "red", adminColor = "yellow", memberColor = "cyan", nameColor = "white";

      for (let i = 0; i < args.length; i += 2) {
        switch (args[i]) {
          case "--bgimg": bgImgURL = args[i + 1]; break;
          case "--color": titleColor = args[i + 1]; break;
          case "--admincolor": adminColor = args[i + 1]; break;
          case "--membercolor": memberColor = args[i + 1]; break;
          case "--namecolor": nameColor = args[i + 1]; break;
        }
      }

      const threadInfo = await api.getThreadInfo(event.threadID);
      const groupName = threadInfo.threadName || "Group";
      const adminIDs = threadInfo.adminIDs.map(e => e.id);
      const allIDs = threadInfo.participantIDs;
      const groupImgURL = threadInfo.imageSrc;

      const avatarSize = 100;
      const margin = 20;
      const perRow = 10;
      const rows = Math.ceil(allIDs.length / perRow);
      const width = perRow * (avatarSize + margin) + margin;
      const height = 460 + rows * (avatarSize + margin);

      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw background safely from Imgur
      try {
        const bgRes = await axios.get(bgImgURL, { responseType: "arraybuffer" });
        const bgBase64 = Buffer.from(bgRes.data, "binary").toString("base64");
        const bgImage = await Canvas.loadImage(`data:image/jpeg;base64,${bgBase64}`);
        ctx.drawImage(bgImage, 0, 0, width, height);
      } catch (e) {
        console.log("Background load failed:", e.message);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
      }

      // Admin and Member counts (top left & right)
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = adminColor;
      ctx.textAlign = "left";
      ctx.fillText(`Admins: ${adminIDs.length}`, margin, 30);

      ctx.fillStyle = memberColor;
      ctx.textAlign = "right";
      ctx.fillText(`Members: ${allIDs.length}`, width - margin, 30);

      // Group logo with gold border
      if (groupImgURL) {
        try {
          const gRes = await axios.get(groupImgURL, { responseType: "arraybuffer" });
          const gBase64 = Buffer.from(gRes.data, "binary").toString("base64");
          const gImg = await Canvas.loadImage(`data:image/png;base64,${gBase64}`);

          const gX = width / 2 - 75, gY = 50;

          ctx.beginPath();
          ctx.arc(gX + 75, gY + 75, 81, 0, Math.PI * 2);
          ctx.lineWidth = 6;
          ctx.strokeStyle = "#FFD700";
          ctx.stroke();

          ctx.save();
          ctx.beginPath();
          ctx.arc(gX + 75, gY + 75, 75, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(gImg, gX, gY, 150, 150);
          ctx.restore();
        } catch (e) {
          console.log("Group logo load failed:", e.message);
        }
      }

      // Group name
      ctx.fillStyle = nameColor;
      ctx.font = "bold 38px Arial";
      ctx.textAlign = "center";
      ctx.fillText(groupName, width / 2, 250);

      // Draw avatars
      let x = margin, y = 300;
      for (const id of allIDs) {
        try {
          const url = `https://graph.facebook.com/${id}/picture?height=150&width=150&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
          const res = await axios.get(url, { responseType: "arraybuffer" });
          const avatarBase64 = Buffer.from(res.data, "binary").toString("base64");
          const avatar = await Canvas.loadImage(`data:image/png;base64,${avatarBase64}`);

          ctx.save();
          ctx.beginPath();
          ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
          ctx.restore();

          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = adminIDs.includes(id) ? adminColor : memberColor;
          ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
          ctx.stroke();
        } catch (e) {
          console.log(`Failed avatar for ${id}:`, e.message);
        }

        x += avatarSize + margin;
        if (x + avatarSize > width - margin) {
          x = margin;
          y += avatarSize + margin;
        }
      }

      const filePath = path.join(__dirname, "gcimg2-output.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      await message.reply({
        body: `✅ Group image generated successfully!`,
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("gcimg2 error:", err);
      message.reply("❌ Something went wrong while generating the image.");
    }
  },
};