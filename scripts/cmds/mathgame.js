const mongoose = require("mongoose");
const fs = require("fs");  // Add this line to import fs

const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const mathStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 }
});
const MathGameStats = mongoose.models.MathGameStats || mongoose.model("MathGameStats", mathStatsSchema);

// Load Quiz Data from JSON
const quizData = JSON.parse(fs.readFileSync("math.json", "utf-8"));

// Get Random Question from JSON
function getQuiz() {
  if (!quizData || quizData.length === 0) return null;
  return quizData[Math.floor(Math.random() * quizData.length)];
}

module.exports = {
  config: {
    name: "mathgame",
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
    const quiz = getQuiz();
    if (!quiz) {
      return api.sendMessage("❌ No quiz available.", event.threadID, event.messageID);
    }

    if (args[0] === "list") {
      const mathStats = await MathGameStats.find({ correctAnswers: { $gt: 0 } }).sort({ correctAnswers: -1 });
      let message = "👑 Math Quiz Rankings:\n\n";
      let index = 0;
      for (const stats of mathStats) {
        const userName = await usersData.getName(stats.userID);
        message += `${index + 1}. ${userName || `User ${stats.userID}`}: ${stats.correctAnswers} wins\n`;
        index++;
      }
      return api.sendMessage(message, event.threadID, event.messageID);
    }

    const { senderID, threadID } = event;
    const maxlimit = 15;
    const mathTimeLimit = 10 * 60 * 60 * 1000;
    const currentTime = Date.now();
    let userData = await usersData.get(senderID);

    if (!userData.data.maths) {
      userData.data.maths = { count: 0, firstMath: currentTime };
    }

    const timeElapsed = currentTime - userData.data.maths.firstMath;
    if (timeElapsed >= mathTimeLimit) {
      userData.data.maths = { count: 0, firstMath: currentTime };
    }

    if (userData.data.maths.count >= maxlimit) {
      const timeLeft = mathTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return api.sendMessage(
        `❌ | You have reached your mathgame limit of ${maxlimit} attempts. Please try again in ${hoursLeft}h ${minutesLeft}m.`,
        threadID,
        event.messageID
      );
    }
    userData.data.maths.count++;
    await usersData.set(senderID, userData);
   
    const { question, correctAnswer, options } = quiz;
    const { a, b, c, d } = options;
    const quizMsg = {
      body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\n𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.`,
    };

    api.sendMessage(quizMsg, event.threadID, (error, info) => {
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
    if (event.senderID !== author) return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);

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

      const userStats = await MathGameStats.findOne({ userID: author });
      if (userStats) {
        userStats.correctAnswers += 1;
        await userStats.save();
      } else {
        await MathGameStats.create({ userID: author, correctAnswers: 1, incorrectAnswers: 0 });
      }

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

      api.sendMessage(`❌ | Wrong answer baby\nYou lost ${penaltyCoins} coins & ${penaltyExp} exp.\nThe correct answer was: ${correctAnswer}`, event.threadID, event.messageID);
    }
  }
};
