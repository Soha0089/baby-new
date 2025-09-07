const fs = require("fs");
const mongoose = require('mongoose');

// MongoDB connection URI
const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

// Define the schema for FreefireGameStats
const freefireGameStatsSchema = new mongoose.Schema({
  userID: String,
  correctAnswers: Number
});

// Check if the model already exists before defining it
const FreefireGameStats = mongoose.models.FreefireGameStats || mongoose.model('FreefireGameStats', freefireGameStatsSchema);

// Load FreeFire Data from JSON
const freefireData = JSON.parse(fs.readFileSync("ff.json", "utf-8"));

// Get Random Question from JSON
function getFreeFire(category) {
  const questions = freefireData.categories[category];
  if (!questions || questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

module.exports = {
  config: {
    name: "freefire2",  // Renamed to 'freefire'
    aliases: ["ffquiz2", "ffqz2"],  // Updated alias to 'ff'
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    if (args[0] === "list") {
      try {
        // Fetch the rankings from MongoDB based on correctAnswers
        const freefireStats = await FreefireGameStats.find({ correctAnswers: { $gt: 0 } })
          .sort({ correctAnswers: -1 }); // Sort by correctAnswers in descending order

        let message = "👑 Free fire Game Rankings:\n\n";
        let index = 0;
        
        // Display rankings and user names
        for (const stats of freefireStats) {
          const userName = await usersData.getName(stats.userID);
          if (userName) {
            message += `${index + 1}. ${userName}: ${stats.correctAnswers} wins\n`;
          } else {
            message += `User with ID ${stats.userID}: ${stats.correctAnswers} wins\n`;
          }
          index++;
        }

        // Send the rankings to the chat
        return api.sendMessage(message, event.threadID, event.messageID);

      } catch (err) {
        console.error("Error fetching stats from MongoDB:", err);
        return api.sendMessage("❌ Unable to fetch rankings at the moment.", event.threadID, event.messageID);
      }
    }

    const input = args.join("").toLowerCase() || "bn";
    const category = input === "en" || input === "english" ? "english" : "bangla";

    const freefire = getFreeFire(category);  // Renamed to 'getFreeFire'
    if (!freefire) {
      return api.sendMessage("❌ No quiz available for this category.", event.threadID, event.messageID);
    }

    const { senderID } = event;
    const maxlimit = 15;
    const freefireTimeLimit = 12 * 60 * 60 * 1000;  // 12 hours
    const currentTime = Date.now();
    const userData = await usersData.get(senderID);

    if (!userData.data.freefires) {  // Changed 'quizs' to 'freefires'
      userData.data.freefires = { count: 0, firstFreeFire: currentTime };
    }

    const timeElapsed = currentTime - userData.data.freefires.firstFreeFire;
    if (timeElapsed >= freefireTimeLimit) {
      userData.data.freefires = { count: 0, firstFreeFire: currentTime };
    }

    if (userData.data.freefires.count >= maxlimit) {  // Changed 'quizs' to 'freefires'
      const timeLeft = freefireTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return api.sendMessage(
        `❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐟𝐫𝐞𝐞𝐟𝐢𝐫𝐞 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐦𝐚𝐱𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦.`,
        event.threadID,
        event.messageID
      );
    }

    userData.data.freefires.count++;  // Changed 'quizs' to 'freefires'
    await usersData.set(senderID, userData);

    const { question, correctAnswer, options } = freefire;  // Renamed to 'freefire'
    const { a, b, c, d } = options;
    const freefireMsg = {  // Renamed to 'freefireMsg'
      body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\n𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.`,
    };

    api.sendMessage(freefireMsg, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        type: "reply",
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID,
        correctAnswer
      });

      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 40000);
    }, event.messageID);
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, author } = Reply;
    if (event.senderID !== author) return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐟𝐫𝐞𝐞𝐟𝐢𝐫𝐞 𝐪𝐮𝐢𝐳 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);

    let userReply = event.body.toLowerCase();
    if (userReply === correctAnswer.toLowerCase()) {
      await api.unsendMessage(Reply.messageID);

      let rewardCoins = 1000;
      let rewardExp = 121;
      let userData = await usersData.get(author);
      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      // Save correct answer to MongoDB
      await FreefireGameStats.updateOne(
        { userID: author },
        { $inc: { correctAnswers: 1 } },
        { upsert: true }
      );

      api.sendMessage(`✅ | Correct answer baby\nYou earned ${rewardCoins} coins & ${rewardExp} exp.`, event.threadID, event.messageID);
    } else {
      await api.unsendMessage(Reply.messageID);

      const penaltyCoins = 300;
      const penaltyExp = 121;
      let userData = await usersData.get(author);
      await usersData.set(author, {
        money: userData.money - penaltyCoins,
        exp: userData.exp - penaltyExp,
        data: userData.data
      });

      // Save incorrect answer to MongoDB
      await FreefireGameStats.updateOne(
        { userID: author },
        { $inc: { correctAnswers: 0 } },
        { upsert: true }
      );

      api.sendMessage(`❌ | Wrong answer baby\nYou lost ${penaltyCoins} coins & ${penaltyExp} exp.\nThe correct answer was: ${correctAnswer}`, event.threadID, event.messageID);
    }
  }
};
