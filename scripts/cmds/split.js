const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "split",
    version: "1.0",
    author: "Mahmud",
    countDown: 5,
    role: 0,
    category: "image",
    shortDescription: "ছবিকে দুই ভাগে ভাগ করো",
    guide: "{pn} (একটি ছবিতে রিপ্লাই দিন)"
  },

  onStart: async function ({ event, api }) {
    try {
      // চেক করো ইউজার কি ছবিতে রিপ্লাই করেছে
      if (!event.messageReply || !event.messageReply.attachments?.[0]?.type?.includes("photo")) {
        return api.sendMessage("❌ অনুগ্রহ করে একটি ছবিতে রিপ্লাই করুন।", event.threadID, event.messageID);
      }

      const imgUrl = event.messageReply.attachments[0].url;
      const img = await loadImage(imgUrl);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      // ডান ও বাম ছবি কেটে নাও
      const leftCanvas = createCanvas(img.width / 2, img.height);
      const rightCanvas = createCanvas(img.width / 2, img.height);

      const leftCtx = leftCanvas.getContext("2d");
      const rightCtx = rightCanvas.getContext("2d");

      // বাম অংশ কাটা
      leftCtx.drawImage(img, 0, 0, img.width / 2, img.height, 0, 0, img.width / 2, img.height);

      // ডান অংশ কাটা
      rightCtx.drawImage(img, img.width / 2, 0, img.width / 2, img.height, 0, 0, img.width / 2, img.height);

      // সেভ করো
      const leftPath = path.join(__dirname, "left.jpg");
      const rightPath = path.join(__dirname, "right.jpg");

      fs.writeFileSync(leftPath, leftCanvas.toBuffer("image/jpeg"));
      fs.writeFileSync(rightPath, rightCanvas.toBuffer("image/jpeg"));

      // সেন্ড ইমেজ
      await api.sendMessage({
        body: "✅ done baby",
        attachment: [
          fs.createReadStream(leftPath),
          fs.createReadStream(rightPath)
        ]
      }, event.threadID, () => {
        fs.unlinkSync(leftPath);
        fs.unlinkSync(rightPath);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ একটি ত্রুটি ঘটেছে।", event.threadID);
    }
  }
};