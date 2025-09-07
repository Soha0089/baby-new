const { MongoClient } = require('mongodb');
const fs = require('fs');

const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";
let db;

async function connectToDB() {
  const client = await MongoClient.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
  db = client.db();
}

let animequizData = [];
try {
  animequizData = JSON.parse(fs.readFileSync("animequiz2.json", "utf-8"));
} catch (error) {
  console.error("Error reading or parsing animequiz2.json:", error);
}

function getQuizFromJSON(category) {
  const filteredQuizzes = animequizData.filter(quiz => quiz.category.toLowerCase() === category);
  return filteredQuizzes.length ? filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)] : null;
}

module.exports = {
  config: {
    name: "animequiz2",
    aliases: ["aniqz2"],
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
      const quizStats = await db.collection('animeQuizStats')
        .find({ correctAnswers: { $gte: 0 } }) // Only consider wins
        .sort({ correctAnswers: -1 })
        .toArray();

      if (quizStats.length === 0) {
        return api.sendMessage("No rankings available yet.", event.threadID, event.messageID);
      }

      let message = "👑 Anime Quiz Game Rankings:\n\n";
      let index = 1;

      for (const stats of quizStats) {
        try {
          const userName = await usersData.getName(stats.userID);
          message += `${index}. ${userName || `User ID ${stats.userID}`}: ${stats.correctAnswers || 0} wins\n`;
        } catch (error) {
          console.error(`Error fetching username for ID ${stats.userID}:`, error);
          message += `${index}. User ID ${stats.userID}: ${stats.correctAnswers || 0} wins\n`;
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
    const animeTimeLimit = 12 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const userData = await usersData.get(senderID);

    if (!userData.data.animes) {
      userData.data.animes = { count: 0, firstAnime: currentTime };
    }

    const timeElapsed = currentTime - userData.data.animes.firstAnime;
    if (timeElapsed >= animeTimeLimit) {
      userData.data.animes = { count: 0, firstAnime: currentTime };
    }

    if (userData.data.animes.count >= maxlimit) {
      const timeLeft = animeTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return api.sendMessage(
        `❌ | You have reached your anime limit. Try again in ${hoursLeft}h ${minutesLeft}m.`,
        event.threadID,
        event.messageID
      );
      }

    userData.data.animes.count++;
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
    if (userReply === correctAnswer.toLowerCase()) {
      await api.unsendMessage(Reply.messageID);

      let rewardCoins = 500;
      let rewardExp = 121;
      let userData = await usersData.get(author);
      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      const quizStats = await db.collection('animeQuizStats').findOne({ userID: author });
      if (quizStats) {
        quizStats.correctAnswers += 1;
        await db.collection('animeQuizStats').updateOne(
          { userID: author },
          { $set: { correctAnswers: quizStats.correctAnswers } }
        );
      } else {
        await db.collection('animeQuizStats').insertOne({ userID: author, correctAnswers: 1 });
      }

      api.sendMessage(`✅ | Correct answer! You earned ${rewardCoins} coins & ${rewardExp} exp.`, event.threadID, event.messageID);
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

      const quizStats = await db.collection('animeQuizStats').findOne({ userID: author });
      if (!quizStats) {
        await db.collection('animeQuizStats').insertOne({ userID: author, correctAnswers: 0 });
      }

      api.sendMessage(`❌ | Wrong answer! You lost ${penaltyCoins} coins & ${penaltyExp} exp.\nThe correct answer was: ${correctAnswer}`, event.threadID, event.messageID);
    }
  }
};

connectToDB().catch(console.error);
