const axios = require("axios");
const mongoose = require("mongoose");

const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  correctAnswersCount: { type: Number, default: 0 },
});

const quizStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
});

const flagStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  winCount: { type: Number, default: 0 },
});

const waifuWinSchema = new mongoose.Schema({
  userID: String,
  winCount: { type: Number, default: 0 }
});

const UserUsage = mongoose.models.UserUsage || mongoose.model("UserUsage", userSchema);
const QuizGameStats = mongoose.models.QuizGameStats || mongoose.model("QuizGameStats", quizStatsSchema);
const FlagGameStats = mongoose.models.FlagGameStats || mongoose.model("FlagGameStats", flagStatsSchema);
const WaifuWin = mongoose.models.WaifuWin || mongoose.model("WaifuWin", waifuWinSchema);

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

function formatMoney(num) {
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud + "/api/jan";
};

function expToLevel(exp) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / 5)) / 2);
}

module.exports = {
  config: {
    name: "spyx",
    version: "1.1",
    role: 0,
    author: "Mahmud",
    category: "general",
    countDown: 5
  },

  onStart: async function ({ event, message, usersData, api, threadsData, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) {
          uid = match[1];
        }
      }
    }

    if (!uid) {
      uid = event.type === "message_reply" ? event.messageReply.senderID : uid2 || uid1;
    }

    const apiUrl = await baseApiUrl();

    let janTeach = "0";
    let janTeachRank = "N/A";
    try {
      const response = await axios.get(`${apiUrl}/list/all`);
      const data = response.data;

      if (data?.data && typeof data.data === "object") {
        const janDataEntries = Object.entries(data.data).map(([key, value]) => ({
          userID: key,
          value: parseInt(value) || 0
        }));

        const sortedJanData = janDataEntries.sort((a, b) => b.value - a.value);
        const userJanData = sortedJanData.find(entry => entry.userID === uid);

        janTeach = userJanData ? userJanData.value.toString() : "0";
        janTeachRank = userJanData ? sortedJanData.findIndex(entry => entry.userID === uid) + 1 : "N/A";
      }
    } catch (err) {
      janTeach = "❌ Error fetching data";
      janTeachRank = "N/A";
      console.error("Jan Teach API error:", err.message);
    }

    const userInfo = await api.getUserInfo(uid);
    const allUsers = await usersData.getAll();

    const sortedRichUsers = allUsers.sort((a, b) => b.money - a.money);
    const richRank = sortedRichUsers.findIndex(user => String(user.userID) === String(uid)) + 1;

    const sortedUsers = allUsers.sort((a, b) => b.exp - a.exp);
    const overallRank = sortedUsers.findIndex(user => String(user.userID) === String(uid)) + 1;

    const userMoney = allUsers.find(user => String(user.userID) === String(uid))?.money || 0;
    const userExp = allUsers.find(user => String(user.userID) === String(uid))?.exp || 0;
    const userLevel = expToLevel(userExp);

    let genderText;
    switch (userInfo[uid].gender) {
      case 1: genderText = "Girl"; break;
      case 2: genderText = "Boy"; break;
      default: genderText = "Other";
    }

    let position = userInfo[uid]?.type || "Normal User";

    const flagGameStats = await FlagGameStats.findOne({ userID: uid });
    const flagWins = flagGameStats ? flagGameStats.winCount : 0;

    const waifuWinStats = await WaifuWin.findOne({ userID: uid });
    const waifuWins = waifuWinStats ? waifuWinStats.winCount : 0;

    const allFlagGameStats = await FlagGameStats.find({}).sort({ winCount: -1 });
    const flagGameRank = allFlagGameStats.findIndex(stats => String(stats.userID) === String(uid)) + 1 || 0;

    const allWaifuStats = await WaifuWin.find({}).sort({ winCount: -1 });
    const waifuGameRank = allWaifuStats.findIndex(stats => String(stats.userID) === String(uid)) + 1 || 0;

    const quizStats = await QuizGameStats.findOne({ userID: uid });
    const correctAnswers = quizStats ? quizStats.correctAnswers : 0;

    const allQuizStats = await QuizGameStats.find({}).sort({ correctAnswers: -1 });
    const quizRank = allQuizStats.findIndex(stats => String(stats.userID) === String(uid)) + 1 || 0;

    const animeQuizStats = await mongoose.connection.db.collection("animeQuizStats")
      .find({ correctAnswers: { $gte: 0 } })
      .sort({ correctAnswers: -1 })
      .toArray();
    const animeQuizRank = animeQuizStats.findIndex(stats => String(stats.userID) === String(uid)) + 1 || 0;
    const animeQuizWins = animeQuizStats.find(stats => String(stats.userID) === String(uid))?.correctAnswers || 0;

    const formattedBalance = formatMoney(userMoney);

    const userInformation = `
╭──── [👑 ${userInfo[uid].name}]
├‣ 🧸 𝐍𝐢𝐜𝐤𝐍𝐚𝐦𝐞: ${userInfo[uid].alternateName || "none"}
├‣ ${genderText === "Boy" ? "🚹" : genderText === "Girl" ? "🚺" : "⚧️"} 𝐆𝐞𝐧𝐝𝐞𝐫: ${genderText}
├🆔 𝐔𝐢𝐝: ${uid}
├🎓 𝐂𝐥𝐚𝐬𝐬: ${position?.toUpperCase() || "Normal User"}
├🎂 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "Private"}
├📛 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${userInfo[uid].vanity || "none"}
╰🤖 𝐁𝐨𝐭 𝐅𝐫𝐢𝐞𝐧𝐝: ${userInfo[uid].isFriend ? "Yes✅" : "No❎"}

╭──── [🏅𝐑𝐚𝐧𝐤 ]
├📈 𝐑𝐚𝐧𝐤 𝐋𝐞𝐯𝐞𝐥: ${userLevel}
╰🥇 𝐑𝐚𝐧𝐤 Ranking: ${overallRank}

╭──── [💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 ]
├💵 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formattedBalance}
╰📉 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 Ranking: ${richRank}

╭──── [🚩 𝐅𝐥𝐚𝐠 𝐆𝐚𝐦𝐞 ]
├🏁 𝐅𝐥𝐚𝐠 𝐖𝐢𝐧𝐬: ${flagWins}
╰🎖️ 𝐅𝐥𝐚𝐠 Ranking: ${flagGameRank}

╭──── [💘 𝐖𝐚𝐢𝐟𝐮 𝐆𝐚𝐦𝐞 ]
├❤️ 𝐖𝐚𝐢𝐟𝐮 𝐖𝐢𝐧𝐬: ${waifuWins}
╰👑 𝐖𝐚𝐢𝐟𝐮 Ranking: ${waifuGameRank}

╭──── [🧠 𝐐𝐮𝐢𝐳 𝐆𝐚𝐦𝐞 ]
├📚 𝐐𝐮𝐢𝐳 𝐖𝐢𝐧𝐬: ${correctAnswers}
╰🏆 𝐐𝐮𝐢𝐳 Ranking: ${quizRank}

╭──── [🎌 𝐀𝐧𝐢𝐦𝐞 𝐐𝐮𝐢𝐳 ]
├🎴 𝐀𝐧𝐢𝐦𝐞 𝐐𝐮𝐢𝐳 𝐖𝐢𝐧𝐬: ${animeQuizWins}
╰🎯 𝐀𝐧𝐢𝐦𝐞 Ranking: ${animeQuizRank}

╭──── [📚 jan teacher ]
├✍️ jan teach: ${janTeach}
╰🎓 𝚃𝚎𝚊𝚌𝚑 Ranking: ${janTeachRank}
    `;

    message.reply({ body: userInformation });
  }
};