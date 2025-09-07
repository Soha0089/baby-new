const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const QrCodeReader = require('qrcode-reader');

module.exports = {
  config: {
    name: "qr",
    version: "1.1",
    author: "RL",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate or decode QR code"
    },
    description: {
      en: "Generate a QR code from text or decode from image"
    },
    category: "tools",
    guide: {
      en: "{pn} <text> - to generate\n{pn} -d (reply to QR image) - to decode"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const isDecode = args[0] === "-d" || args[0] === "/decode";

    // --- Decode QR code ---
    if (isDecode) {
      const reply = event.messageReply;
      if (!reply || !reply.attachments || reply.attachments[0].type !== "photo")
        return message.reply("Please reply to a QR code image to decode.");

      const imageUrl = reply.attachments[0].url;
      const tempPath = path.join(__dirname, "temp_qr.jpg");

      const download = require("node:https").get(imageUrl, res => {
        const file = fs.createWriteStream(tempPath);
        res.pipe(file);
        file.on("finish", async () => {
          file.close();
          const img = await Jimp.read(tempPath);
          const qr = new QrCodeReader();
          qr.callback = (err, value) => {
            fs.unlinkSync(tempPath);
            if (err || !value) return message.reply("Failed to decode QR code.");
            message.reply("Decoded QR content:\n" + value.result);
          };
          qr.decode(img.bitmap);
        });
      });

      return;
    }

    // --- Generate QR code ---
    const text = args.join(" ");
    if (!text) return message.reply("Please provide text to generate QR code.");

    const outputPath = path.join(__dirname, "qr_temp.png");
    try {
      await QRCode.toFile(outputPath, text, {
        color: { dark: "#000", light: "#FFF" }
      });

      message.reply({
        body: "Here is your QR code:",
        attachment: fs.createReadStream(outputPath)
      }, () => fs.unlinkSync(outputPath));
    } catch (err) {
      console.error(err);
      message.reply("Failed to generate QR code.");
    }
  }
};