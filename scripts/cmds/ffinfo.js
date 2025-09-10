const axios = require("axios");

module.exports = {
  config: {
    name: "ffinfo",
    aliases: ["ffuid"],
    version: "1.0",
    author: "Mahmud (Converted)",
    role: 0,
    shortDescription: "Get Free Fire player info",
    longDescription: "Fetches Free Fire player profile info using UID",
    category: "game",
    guide: "{pn} <uid>"
  },

  onStart: async function ({ api, event, args }) {
    const uid = args[0];
    if (!uid) {
      return api.sendMessage("⚠️ Please provide a Free Fire UID.", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`https://mahmud-global-apis.onrender.com/api/ffinfo?uid=${uid}`);
      const data = res.data;

      if (data.error) {
        return api.sendMessage(`❌ ${data.error}`, event.threadID, event.messageID);
      }

      let msg = `🎮 Free Fire Player Info 🎮\n\n`;
      msg += `👤 Name: ${data.name}\n`;
      msg += `🆔 UID: ${data.uid}\n`;
      msg += `⭐ Level: ${data.level} (Exp: ${data.exp})\n`;
      msg += `🌍 Region: ${data.region}\n`;
      msg += `👍 Likes: ${data.likes}\n`;
      msg += `🏅 Honor Score: ${data.honorScore}\n`;
      msg += `💬 Signature: ${data.signature}\n\n`;

      msg += `📅 Created: ${data.createdAt}\n`;
      msg += `⏰ Last Login: ${data.lastLogin}\n`;
      msg += `📊 BR Rank: ${data.brRank}\n`;
      msg += `📊 CS Rank: ${data.csRank}\n\n`;

      if (data.pet) {
        msg += `🐾 Pet: ${data.pet.name} (Lv.${data.pet.level}, Exp: ${data.pet.exp})\n`;
      }

      if (data.guild) {
        msg += `👥 Guild: ${data.guild.name} (Lv.${data.guild.level})\n`;
        msg += `🔑 Leader: ${data.guild.leader}\n`;
      }

      api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ API error, try again later.", event.threadID, event.messageID);
    }
  }
};
