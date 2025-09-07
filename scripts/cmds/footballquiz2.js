const mongoose = require('mongoose');
const fs = require('fs');

let footballquizData = [];
try {
  footballquizData = JSON.parse(fs.readFileSync("footballquiz2.json", "utf-8"));
} catch (error) {
  console.error("Error reading or parsing footballquiz2.json:", error);
}

const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

let FootballQuizStats;
try {
  FootballQuizStats = mongoose.model('footballquiz');  // Attempt to use the existing model if defined
} catch (error) {
  const footballQuizSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    correctAnswers: { type: Number, default: 0 },
  });

  FootballQuizStats = mongoose.model('footballquiz', footballQuizSchema);  // Define the model if it doesn't exist
}

function getQuizFromJSON(category) {
  const filteredQuizzes = footballquizData.filter(quiz => quiz.category.toLowerCase() === category);
  return filteredQuizzes.length ? filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)] : null;
}

module.exports = {
  config: {
    name: "football2",
    aliases: ["fbqz2", "fbquiz2", "footballquiz2"],
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
      const quizStats = await FootballQuizStats.find({ correctAnswers: { $gt: 0 } }).sort({ correctAnswers: -1 });
      let message = "👑 Quiz Game Rankings:\n\n";
      let index = 0;
      for (const stats of quizStats) {
        const userName = await usersData.getName(stats.userID);
        if (userName) {
          message += `${index + 1}. ${userName}: ${stats.correctAnswers} wins\n`;
        } else {
          message += `User with ID ${stats.userID}: ${stats.correctAnswers} wins\n`;     
        }
        index++;
      }
      return api.sendMessage(message, event.threadID, event.messageID);
    }

    const input = args.join("").toLowerCase() || "bn";
    const category = input === "en" || input === "english" ? "english" : "bangla";

    const quiz = getQuizFromJSON(category);
    if (!quiz) {
      return api.sendMessage("❌ No quiz available for this category.", event.threadID, event.messageID);
    }

    const { senderID } = event;
    const maxlimit = 15;
    const footballTimeLimit = 12 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const userData = await usersData.get(senderID);

    if (!userData.data.footballs) {
      userData.data.footballs = { count: 0, firstFootball: currentTime };
    }

    const timeElapsed = currentTime - userData.data.footballs.firstFootball;
    if (timeElapsed >= footballTimeLimit) {
      userData.data.footballs = { count: 0, firstFootball: currentTime };
    }

    if (userData.data.footballs.count >= maxlimit) {
      const timeLeft = footballTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return api.sendMessage(
        `❌ | You have reached your football quiz limit. Try again in ${hoursLeft}h ${minutesLeft}m.`,
        event.threadID,
        event.messageID
      );
    }

    userData.data.footballs.count++;
    await usersData.set(senderID, userData);

    const { question, correctAnswer, options } = quiz;
    const { a, b, c, d } = options;
    const quizMsg = {
      body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\nReply with your answer.`,
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
      }, 20000);
    }, event.messageID);
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, author } = Reply;
    if (event.senderID !== author) return api.sendMessage("This is not your quiz.", event.threadID, event.messageID);

    let userReply = event.body.toLowerCase();
    let userData = await usersData.get(author);

    if (userReply === correctAnswer.toLowerCase()) {
      await api.unsendMessage(Reply.messageID);

      let rewardCoins = 500;
      let rewardExp = 121;

      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      const existingUser = await FootballQuizStats.findOne({ userID: author });
      if (existingUser) {
        existingUser.correctAnswers += 1;
        await existingUser.save();
      } else {
        const newUser = new FootballQuizStats({ userID: author, correctAnswers: 1 });
        await newUser.save();
      }

      api.sendMessage(`✅ | Correct answer! You earned ${rewardCoins} coins & ${rewardExp} exp.`, event.threadID, event.messageID);
    } else {
      await api.unsendMessage(Reply.messageID);

      const penaltyCoins = 300;
      const penaltyExp = 121;
      await usersData.set(author, {
        money: userData.money - penaltyCoins,
        exp: userData.exp - penaltyExp,
        data: userData.data
      });

      api.sendMessage(`❌ | Wrong answer! You lost ${penaltyCoins} coins & ${penaltyExp} exp.\nThe correct answer was: ${correctAnswer}`, event.threadID, event.messageID);
    }
  }
};