const fs = require("fs");
const axios = require("axios");
const mongoose = require('mongoose');

const freefireCharacters = JSON.parse(fs.readFileSync("freefire.json", "utf-8"));
const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

const freefireGameStatsSchema = new mongoose.Schema({
  userID: String,
  correctAnswers: Number
});

const FreefireGameStats = mongoose.models.FreefireGameStats || mongoose.model('FreefireGameStats', freefireGameStatsSchema);

module.exports = {
  config: {
    name: "freefire",
    aliases: ["ffqz", "ffgame", "ffquiz", "ff"],
    version: "1.9",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { character, author } = Reply;
    const getCoin = 1000;
    const getExp = 121;
    const penaltyCoin = 300;
    const penaltyExp = 100;
    const userData = await usersData.get(event.senderID);

    if (event.senderID !== author) {
      return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐟𝐫𝐞𝐞𝐟𝐢𝐫𝐞 𝐜𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    if (reply === character.toLowerCase()) {
      try {
        await api.unsendMessage(Reply.messageID);
        userData.money += getCoin;
        userData.exp += getExp;
        await usersData.set(event.senderID, userData);
        await FreefireGameStats.findOneAndUpdate(
          { userID: event.senderID },
          { $inc: { correctAnswers: 1 } },
          { upsert: true, new: true }
        );
        api.sendMessage(`✅ | Correct answer, baby.\nYou have earned ${getCoin} coins and ${getExp} exp.`, event.threadID, event.messageID);
      } catch (err) {
        console.log("Error:", err.message);
      }
    } else {
      await api.unsendMessage(Reply.messageID);
      userData.money -= penaltyCoin;
      userData.exp -= penaltyExp;
      await usersData.set(event.senderID, userData);
      api.sendMessage(`❌ | Wrong Answer!\nYou lost ${penaltyCoin} coins & ${penaltyExp} exp.\nCorrect answer was: ${character}`, event.threadID, event.messageID);
    }
  },

  onStart: async function ({ api, args, event, usersData }) {
    try {
      const { senderID } = event;
      if (args[0] === "list") {
        try {
          const freefireStats = await FreefireGameStats.find({ correctAnswers: { $gt: 0 } }).sort({ correctAnswers: -1 });
          let message = "👑 Free fire Game Rankings:\n\n";
          let index = 0;
          for (const stats of freefireStats) {
            const userName = await usersData.getName(stats.userID);
            message += `${++index}. ${userName || `User ${stats.userID}`}: ${stats.correctAnswers} wins\n`;
          }
          return api.sendMessage(message, event.threadID, event.messageID);
        } catch (err) {
          console.error("MongoDB fetch error:", err);
          return api.sendMessage("❌ Unable to fetch rankings at the moment.", event.threadID, event.messageID);
        }
      }

      const maxlimit = 20;
      const freefireTimeLimit = 10 * 60 * 60 * 1000;
      const currentTime = Date.now();
      const userData = await usersData.get(senderID);

      if (!userData.data.freefires) {
        userData.data.freefires = { count: 0, firstFreeFire: currentTime };
      }

      const timeElapsed = currentTime - userData.data.freefires.firstFreeFire;
      if (timeElapsed >= freefireTimeLimit) {
        userData.data.freefires = { count: 0, firstFreeFire: currentTime };
      }

      if (userData.data.freefires.count >= maxlimit) {
        const timeLeft = freefireTimeLimit - timeElapsed;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        return api.sendMessage(`❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐟𝐫𝐞𝐞𝐟𝐢𝐫𝐞 𝐥𝐢𝐦𝐢𝐭.\nTry again in ${hoursLeft}h ${minutesLeft}m.`, event.threadID, event.messageID);
      }

      userData.data.freefires.count++;
      await usersData.set(senderID, userData);

      const randomCharacter = freefireCharacters[Math.floor(Math.random() * freefireCharacters.length)];
      const response = await axios({
        url: randomCharacter.imgurLink,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage({
        body: "A random Freefire character has appeared! Guess the character name.",
        attachment: response.data
      }, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: senderID,
          character: randomCharacter.name
        });

        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 40000);
      }, event.messageID);
    } catch (error) {
      console.error("Start error:", error.message);
      api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};