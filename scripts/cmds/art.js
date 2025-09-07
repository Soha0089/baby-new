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

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "art",
    aliases: [],
    version: "1.7",
    role: 0,
    author: "MahMUD",
    countDown: 10,
    category: "Image gen",
    guide: {
      en: "Reply to an image and specify a style number to apply a filter.\nExample: art 4\nUse 'art list' to view available styles."
    }
  },

  onStart: async function ({ message, event, args, api, usersData }) {
    if (!db) {
      return message.reply("❌ | Database connection is not initialized.");
    }

    // VIP check function
    const checkVip = async (uid) => {
      const collection = db.collection("vipUser");
      const user = await collection.findOne({ uid });
      return user && user.expiredAt > new Date();
    };

    const isVip = await checkVip(event.senderID);
    if (!isVip) {
      return message.reply("🥹 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚 𝐕𝐈𝐏 𝐮𝐬𝐞𝐫.");
    }

    const apiUrl = await baseApiUrl();

    if (args[0] === "list") {
      try {
        const response = await axios.get(`${apiUrl}/api/art/list`);
        return message.reply(`🎨 Available Styles:\n\n${response.data.styles}`);
      } catch {
        return message.reply("❌ Failed to fetch style list.");
      }
    }

    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]?.url) {
      return message.reply("❌ Please reply to an image to apply the art style.");
    }

    const styleId = (args[0] && !isNaN(args[0])) ? args[0] : "1";
    const imageUrl = event.messageReply.attachments[0].url;

    let styleName = `Style #${styleId}`;
    try {
      const response = await axios.get(`${apiUrl}/api/art/list`);
      const styles = response.data.styles.split("\n");
      if (styles[styleId - 1]) {
        styleName = styles[styleId - 1].trim();
      }
    } catch {}

    const waitingMessage = await message.reply(`🎨 | Applying ${styleName} style, please wait...`);

    try {
      const res = await axios.post(`${apiUrl}/api/art`, {
        styleId,
        imageUrl
      });

      if (!res.data.generatedImage) {
        return message.reply("❌ Failed to generate styled image. Try a different one.");
      }

      const imgStream = await axios.get(res.data.generatedImage, { responseType: "stream" });
      const outputPath = path.join(__dirname, "cache", `art-${Date.now()}.png`);
      const writer = fs.createWriteStream(outputPath);

      imgStream.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `✅| Here is your art image style: ${styleName}`,
          attachment: fs.createReadStream(outputPath)
        });

        api.unsendMessage(waitingMessage.messageID);
        fs.unlinkSync(outputPath);
      });

      writer.on("error", () => {
        message.reply("❌ Error saving image.");
      });

    } catch {
      message.reply("❌ Failed to apply the style. Please try again.");
    }
  }
};
