const axios = require("axios");
const mongoose = require("mongoose");

const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB Error:", err);
});

// Schema
const wordGameStatsSchema = new mongoose.Schema({
  userID: String,
  name: String,
  winCount: {
    type: Number,
    default: 0
  }
});

const WordGameStats = mongoose.models.WordGameStats || mongoose.model("WordGameStats", wordGameStatsSchema);

module.exports = {
  config: {
    name: "wordguess",
    aliases: ["wordgame", "wdgame"],
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "game",
    guide: {
      en: "{pn} — start game\n{pn} list — show leaderboard"
    }
  },

  onStart: async function ({ message, event, args, commandName, usersData, api }) {
    if (args[0] === "list") {
      try {
        const topUsers = await WordGameStats.find().sort({ winCount: -1 }).limit(10);
        let msg = "👑 Word guess Game Ranking:\n\n";
        let index = 1;

        for (const stats of topUsers) {
          const userName = await usersData.getName(stats.userID);
          if (userName) {
            msg += `${index}. ${userName}: ${stats.winCount} wins\n`;
          } else {
            msg += `${index}. User (${stats.userID}): ${stats.winCount} wins\n`;
          }
          index++;
        }

        return message.reply(msg);
      } catch (err) {
        console.error(err);
        return message.reply("Something went wrong while loading the leaderboard.");
      }
    }

    try {
      const res = await axios.get("https://mahmud-global-apis.onrender.com/api/word/random");
      const randomWord = res.data.word;
      const shuffledWord = shuffleWord(randomWord);

      message.reply(`╭‣ 𝐆𝐮𝐞𝐬𝐬 𝐭𝐡𝐞 𝐰𝐨𝐫𝐝:\n╰──‣ "${shuffledWord}" ?`, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            answer: randomWord,
            level: 1
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 30000);
        }
      });
    } catch (err) {
      message.reply("Failed to fetch a word from the API.");
    }
  },

  onReply: async function ({ message, Reply, event, usersData, commandName, api }) {
    const { author, answer, messageID, level } = Reply;

    if (event.senderID !== author)
      return message.reply("Not your turn, baka 🐸");

    if (formatText(event.body) === formatText(answer)) {
      const reward = level * 10000;
      await usersData.addMoney(event.senderID, reward);

      await WordGameStats.findOneAndUpdate(
        { userID: event.senderID },
        { $inc: { winCount: 1 } },
        { upsert: true, new: true }
      );

      message.unsend(messageID);

      try {
        const res = await axios.get("https://mahmud-global-apis.onrender.com/api/word/random");
        const nextWord = res.data.word;
        const shuffledNextWord = shuffleWord(nextWord);

        message.reply(
          `✅ | Correct!\nYou won ${formatMoney(reward)}\nNext word: "${shuffledNextWord}" ?`,
          (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                answer: nextWord,
                level: level + 1
              });

              setTimeout(() => {
                api.unsendMessage(info.messageID);
              }, 30000);
            }
          }
        );
      } catch (error) {
        message.reply(`✅ | Correct!\nYou won ${formatMoney(reward)}\nBut couldn't fetch the next word.`);
      }
    } else {
      message.unsend(messageID);
      message.reply(`❌ | Wrong Answer\nCorrect answer: ${answer}`);
    }
  }
};

function shuffleWord(word) {
  const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
  return shuffled === word ? shuffleWord(word) : shuffled;
}

function formatText(text) {
  return text.toLowerCase();
}

function formatMoney(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num;
}