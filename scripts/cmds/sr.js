const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const uri = 'mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'vipUser';

let db;
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = {
  config: {
    name: "sr",
    aliases: ["srlens"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "search",
    guide: {
      en: "{p}sr [reply to an image]"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!db) return api.sendMessage("❌ | Database connection is not initialized.", event.threadID, event.messageID);

    const checkVip = async (uid) => {
      const collection = db.collection("vipUser");
      const user = await collection.findOne({ uid });
      return user && user.expiredAt > new Date();
    };

    const isVip = await checkVip(event.senderID);
    if (!isVip) return api.sendMessage(">🥹\n𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚 𝐕𝐈𝐏 𝐮𝐬𝐞𝐫", event.threadID, event.messageID);
   
    try {
      let imageUrl;

      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args[0]) {
        imageUrl = args[0];
      }

      if (!imageUrl) {
        return api.sendMessage("❌ Please reply to an image or provide an image URL.", event.threadID, event.messageID);
      }

      const API_KEY = "373f4a6840ddabf4a1a410fa99b52a57d27ca557ab640e92b0b4ca51492e8abf";

      const res = await axios.get("https://serpapi.com/search.json", {
        params: {
          engine: "google_lens",
          url: imageUrl,
          api_key: API_KEY
        }
      });

      const matches = res.data.visual_matches;
      if (!matches || matches.length === 0) {
        return api.sendMessage("🔎 No similar images found.", event.threadID, event.messageID);
      }

      const topImages = matches.slice(0, 6);
      const attachments = [];
      let messageText = "🔎 Similar Images Found:\n\n";

      for (let i = 0; i < topImages.length; i++) {
        // Use original if available, otherwise thumbnail
        const imgUrl = topImages[i].original || topImages[i].thumbnail;
        if (!imgUrl) continue;

        const imgPath = path.join(__dirname, `temp_${i}.png`);
        const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

        attachments.push(fs.createReadStream(imgPath));

        messageText += `${i + 1}. ${topImages[i].title || "No title"}\nSource: ${topImages[i].source || "Unknown"}\n\n`;
      }

      if (attachments.length === 0) {
        return api.sendMessage("⚠️ No images available to send.", event.threadID, event.messageID);
      }

      await api.sendMessage({ body: messageText, attachment: attachments }, event.threadID);

      // Delete temp files
      attachments.forEach((_, i) => fs.unlinkSync(path.join(__dirname, `temp_${i}.png`)));

    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      api.sendMessage("⚠️ Error fetching similar images.", event.threadID, event.messageID);
    }
  }
};
