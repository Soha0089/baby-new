const moment = require("moment-timezone");
const { createCanvas } = require("@napi-rs/canvas");
const { writeFileSync } = require("fs-extra");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "calendar",
    version: "1.1",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    shortDescription: "Show current calendar",
    longDescription: "Show the current month's calendar with today highlighted",
    category: "utility",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    const today = moment().tz("Asia/Dhaka");
    const year = today.year();
    const month = today.month();
    const day = today.date();

    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = "#000";
    ctx.font = "bold 40px Sans";
    ctx.textAlign = "center";
    ctx.fillText(today.format("MMMM YYYY"), 400, 60);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    ctx.font = "bold 26px Sans";
    for (let i = 0; i < 7; i++) {
      ctx.fillText(days[i], 100 + i * 90, 110);
    }

    const startOfMonth = moment([year, month]).startOf("month");
    const endOfMonth = moment([year, month]).endOf("month");
    const startDay = startOfMonth.day();

    ctx.font = "24px Sans";
    for (let i = 0; i < 42; i++) {
      const row = Math.floor(i / 7);
      const col = i % 7;
      const dayNum = i - startDay + 1;

      if (dayNum >= 1 && dayNum <= endOfMonth.date()) {
        const x = 100 + col * 90;
        const y = 180 + row * 60;

        if (dayNum === day) {
          ctx.fillStyle = "#ffd700";
          ctx.beginPath();
          ctx.arc(x, y - 20, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
        } else {
          ctx.fillStyle = "#000";
        }

        ctx.fillText(dayNum.toString(), x, y);
      }
    }

    const imgPath = path.join(__dirname, `calendar-${event.senderID}.png`);
    writeFileSync(imgPath, canvas.toBuffer("image/png"));

    return message.reply({
      body: "📅 Here's your calendar:",
      attachment: fs.createReadStream(imgPath)
    });
  }
};
