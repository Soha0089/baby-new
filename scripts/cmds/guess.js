module.exports = {
    config: {
        name: "guess",
        version: "1.7",
        author: "MahMUD",
        countDown: 10,
        role: 0,
        category: "game",
        guide: "{prefix}guessmnumber [your guess]\n{prefix}randomnumber rules"
    },

    formatMoney(num) {
        const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"];
        let unit = 0;
        while (num >= 1000 && ++unit < units.length) num /= 1000;
        return num.toFixed(1).replace(/\.0$/, "") + units[unit];
    },

    getRandomWinAmount() {
        const winAmounts = [5000, 7000, 9000, 11000, 13000, 15000, 17000, 20000, 50000, 100000];
        return winAmounts[Math.floor(Math.random() * winAmounts.length)];
    },

    getRandomLoseAmount() {
        const loseAmounts = [2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000, 20000];
        return loseAmounts[Math.floor(Math.random() * loseAmounts.length)];
    },

    onStart: async function ({ event, api, args, usersData }) {
        const { senderID } = event;
const maxlimit = 10;
const randomTimeLimit = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const cooldownTime = 10 * 1000; // 10 seconds cooldown
const currentTime = Date.now();
let userData = await usersData.get(senderID);

// Check if user has enough coins to play
if (userData.money < 10000) {
    return api.sendMessage(
        "❌ | 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 𝐚𝐭 𝐥𝐞𝐚𝐬𝐭 𝟏𝟎𝐊 𝐌𝐨𝐧𝐞𝐲 𝐭𝐨 𝐩𝐥𝐚𝐲 𝐭𝐡𝐢𝐬 𝐠𝐚𝐦𝐞!",
        event.threadID,
        event.messageID
    );
}

if (!userData.data.randoms) {
    userData.data.randoms = { count: 0, firstRandom: currentTime };
}
if (!userData.data.lastGuessTime) {
    userData.data.lastGuessTime = 0;
}

const timeSinceLastGuess = currentTime - userData.data.lastGuessTime;
if (timeSinceLastGuess < cooldownTime) {
    const waitTime = ((cooldownTime - timeSinceLastGuess) / 1000).toFixed(1);
    return api.sendMessage(`⏳ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 ${waitTime} 𝐬𝐞𝐜𝐨𝐧𝐝𝐬 𝐛𝐞𝐟𝐨𝐫𝐞 𝐠𝐮𝐞𝐬𝐬𝐢𝐧𝐠 𝐚𝐠𝐚𝐢𝐧.`, event.threadID, event.messageID);
}
userData.data.lastGuessTime = currentTime;

const timeElapsed = currentTime - userData.data.randoms.firstRandom;
if (timeElapsed >= randomTimeLimit) {
    userData.data.randoms = { count: 0, firstRandom: currentTime };
}

if (userData.data.randoms.count >= maxlimit) {
    const timeLeft = randomTimeLimit - timeElapsed;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return api.sendMessage(
        `❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐠𝐮𝐞𝐬𝐬 𝐥𝐢𝐦𝐢𝐭. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦.`,
        event.threadID,
        event.messageID
    );
}

        if (args[0] && args[0].toLowerCase() === "rules") {
            return api.sendMessage(
                "𝐆𝐮𝐞𝐬𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 𝐆𝐚𝐦𝐞 𝐑𝐮𝐥𝐞𝐬 📌\n\n" +
                "1️⃣ Use the command: !guess [your guess]\n" +
                "2️⃣ Guess a number between 1 and 3.\n" +
                "3️⃣ If your guess matches the bot's number, you win coins.\n" +
                "4️⃣ If your guess is incorrect, you lose coins (but your balance won't go below 0).\n" +
                "5️⃣ Each round, the win/loss amount is randomly selected.\n\n" +
                "🎮 Example: `!randomnumber 3`",
                event.threadID,
                event.messageID
            );
        }

        const randomNumber = Math.floor(Math.random() * 3) + 1;
        const userGuess = parseInt(args[0]);

        if (isNaN(userGuess) || userGuess < 1 || userGuess > 3) {
            return api.sendMessage("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 𝐛𝐞𝐭𝐰𝐞𝐞𝐧 𝟏 𝐚𝐧𝐝 𝟑 𝐭𝐨 𝐩𝐥𝐚𝐲.", event.threadID, event.messageID);
        }

        let winAmount = this.getRandomWinAmount();
        let loseAmount = this.getRandomLoseAmount();

        if (userGuess === randomNumber) {
            userData.data.randoms.count++;
            userData.money += winAmount;
            await usersData.set(senderID, userData);

            return api.sendMessage(
                `╭‣ 𝐓𝐡𝐞 𝐧𝐮𝐦𝐛𝐞𝐫 𝐰𝐚𝐬 ${randomNumber}\n╰‣ 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐖𝐢𝐧 ${this.formatMoney(winAmount)} 😘`,
                event.threadID,
                event.messageID
            );
        } else {
            userData.data.randoms.count++;
            userData.money = Math.max(0, userData.money - loseAmount);
            await usersData.set(senderID, userData);

            return api.sendMessage(
                `╭‣ 𝐓𝐡𝐞 𝐧𝐮𝐦𝐛𝐞𝐫 𝐰𝐚𝐬 ${randomNumber}\n╰‣ 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐋𝐨𝐬𝐞 ${this.formatMoney(loseAmount)} 🥺`,
                event.threadID,
                event.messageID
            );
        }
    }
};
