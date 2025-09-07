const axios = require('axios');

module.exports = {
  config: {
    name: "gojo",
    aliases: ["gojo"],
    version: "1.0",
    author: "MahMUD彡",
    countDown: 5,
    role: 0,
    shortDescription: "send you pic&video of gojo",
    longDescription: "",
    category: "anime",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const links = [
      "https://i.imgur.com/0yA9ZpW.mp4",
      "https://i.imgur.com/RKTWov0.jpeg",
      "https://i.imgur.com/vBocwop.jpeg",
      "https://i.imgur.com/tTZsRfh.jpeg",
      "https://i.imgur.com/yT69Sac.jpeg",
      "https://i.imgur.com/1qWJ1vy.jpeg",
      "https://i.imgur.com/Xc2uBRl.jpeg",
      "https://i.imgur.com/kU4R0XK.jpeg",
      "https://i.imgur.com/lDDBFYH.mp4",
      "https://i.imgur.com/hwFV9Sq.jpeg",
      "https://i.imgur.com/T48CEO6.jpeg",
      "https://i.imgur.com/W8GfqZN.jpeg",
      "https://i.imgur.com/zkApVTb.jpeg",
      "https://i.imgur.com/emUbsFl.jpeg",
      "https://i.imgur.com/WYBJMjm.jpeg",
      "https://i.imgur.com/QHQGDBj.jpeg",
      "https://i.imgur.com/vtCL7i6.jpeg",
      "https://i.imgur.com/2RDEUIR.jpeg",
      "https://i.imgur.com/AnqajiQ.jpeg",
      "https://i.imgur.com/NinTb5o.jpeg",
      "https://i.imgur.com/QgBL32P.jpeg",
      "https://i.imgur.com/NinTb5o.jpeg",
      "https://i.imgur.com/QgBL32P.jpeg",
      "https://i.imgur.com/gME3HeC.jpeg",
      "https://i.imgur.com/OcVyAEg.jpeg"
    ];

    const randomLink = links[Math.floor(Math.random() * links.length)];

    try {
      const response = await axios({
        method: 'GET',
        url: randomLink,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36'
        }
      });

      message.send({
        body: 'Satoru Gojo🦋',
        attachment: response.data
      });
    } catch (error) {
      message.send("Failed to fetch Gojo image/video.");
      console.error("Error fetching media:", error);
    }
  }
};