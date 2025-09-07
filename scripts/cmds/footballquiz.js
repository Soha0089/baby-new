const axios = require("axios");
const mongoose = require("mongoose");

const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const footballWinSchema = new mongoose.Schema({
  userID: String,
  winCount: { type: Number, default: 0 }
});

const footballWin = mongoose.models.footballWin || mongoose.model("footballWin", footballWinSchema);

let FootballQuizStats;
try {
  FootballQuizStats = mongoose.model('footballquiz');
} catch (error) {
  const footballQuizSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    correctAnswers: { type: Number, default: 0 },
  });
  FootballQuizStats = mongoose.model('footballquiz', footballQuizSchema);
}

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "football",
    aliases: ["footballgame"],
    version: "1.8",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} [list/myrank]"
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { footballNames, author, messageID } = Reply;
    const getCoin = 1000;
    const getExp = 121;
    const penaltyCoin = 300;
    const penaltyExp = 100;

    if (event.senderID !== author) {
      return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);
    }

    const reply = event.body.trim().toLowerCase();
    const isCorrect = footballNames.some(name => name.toLowerCase() === reply);
    const userData = await usersData.get(event.senderID);

    await api.unsendMessage(messageID);

    if (isCorrect) {
      try {
        await usersData.set(event.senderID, {
          money: userData.money + getCoin,
          exp: userData.exp + getExp
        });

        // Update footballWin for total wins count
        await footballWin.findOneAndUpdate(
          { userID: event.senderID },
          { $inc: { winCount: 1 } },
          { upsert: true }
        );

        // Update FootballQuizStats for correct answers
        await FootballQuizStats.findOneAndUpdate(
          { userID: event.senderID },
          { $inc: { correctAnswers: 1 } },
          { upsert: true }
        );

        return api.sendMessage(
          `✅ | Correct answer baby.\nYou have earned ${getCoin} coins and ${getExp} exp.`,
          event.threadID,
          event.messageID
        );
      } catch (err) {
        console.log("Error:", err.message);
      }
    } else {
      try {
        await usersData.set(event.senderID, {
          money: userData.money - penaltyCoin,
          exp: userData.exp - penaltyExp
        });

        return api.sendMessage(
          `❌ | Wrong Answer baby.\nYou lost ${penaltyCoin} coins & ${penaltyExp} exp.\nCorrect answer was: ${footballNames.join(" / ")}`,
          event.threadID,
          event.messageID
        );
      } catch (err) {
        console.log("Error:", err.message);
      }
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const { senderID } = event;
      const maxlimit = 15; // max attempts per 12 hours
      const footballTimeLimit = 12 * 60 * 60 * 1000; // 12 hours
      const currentTime = Date.now();
      const userData = await usersData.get(senderID);

      // Initialize usage tracking if missing
      if (!userData.data.footballs) {
        userData.data.footballs = { count: 0, firstFootball: currentTime };
      }

      const timeElapsed = currentTime - userData.data.footballs.firstFootball;

      // Reset count if time window elapsed
      if (timeElapsed >= footballTimeLimit) {
        userData.data.footballs = { count: 0, firstFootball: currentTime };
      }

      // Handle commands "list" and "myrank"
      if (args[0] === "list") {
        const quizStats = await FootballQuizStats.find({ correctAnswers: { $gt: 0 } }).sort({ correctAnswers: -1 });
        if (quizStats.length === 0) {
          return api.sendMessage("No rankings available yet.", event.threadID, event.messageID);
        }
        let message = "👑 Football Quiz Game Rankings:\n\n";
        let index = 0;
        for (const stats of quizStats) {
          const userName = await usersData.getName(stats.userID) || `User ${stats.userID}`;
          message += `${index + 1}. ${userName}: ${stats.correctAnswers} wins\n`;
          index++;
        }
        return api.sendMessage(message, event.threadID, event.messageID);
      }

      if (args[0] === "rank") {
        const quizStats = await FootballQuizStats.find({ correctAnswers: { $gt: 0 } }).sort({ correctAnswers: -1 });
        const myRank = quizStats.findIndex(stat => stat.userID === senderID);
        if (myRank === -1) {
          return api.sendMessage("❌ | You have not won any football games yet.", event.threadID, event.messageID);
        }
        const userWins = quizStats[myRank].correctAnswers;
        return api.sendMessage(`🏅 | Your Football Rank:\n• Rank: ${myRank + 1}\n• Wins: ${userWins}`, event.threadID, event.messageID);
      }

      // Check if user reached limit
      if (userData.data.footballs.count >= maxlimit) {
        const timeLeft = footballTimeLimit - timeElapsed;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        return api.sendMessage(
          `❌ | You have reached your football quiz limit.\nTry again in ${hoursLeft}h ${minutesLeft}m.`,
          event.threadID,
          event.messageID
        );
      }

      // Increment count
      userData.data.footballs.count++;
      await usersData.set(senderID, userData);

      // Fetch football data from API
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/football`);
      const { name, imgurLink } = response.data.football;
      const footballNames = Array.isArray(name) ? name : [name];

      const imageStream = await axios({
        url: imgurLink,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage(
        {
          body: "⚽ A famous footballer has appeared! Guess their name.",
          attachment: imageStream.data
        },
        event.threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: senderID,
            footballNames
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 40000);
        },
        event.messageID
      );
    } catch (error) {
      console.error("Error:", error.message);
      api.sendMessage("Failed to start football game.", event.threadID, event.messageID);
    }
  }
};