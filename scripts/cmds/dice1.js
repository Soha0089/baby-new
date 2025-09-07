module.exports = {
    config: {
        name: "dicegame",
        aliases: ["dice"],
        version: "1.7",
        author: "MahMud",
        role: 0,
        shortDescription: "Bet on a dice roll",
        longDescription: "Roll a dice against the bot. Win to double your bet, lose and lose your money!",
        category: "game",
        guide: "{p}dicegame <bet amount>"
    },

    onStart: async function ({ event, args, usersData, api }) {
        const { senderID } = event;
        const maxlimit = 10;
        const diceTimeLimit = 10 * 60 * 60 * 1000;  // 12 hours
        const cooldownTime = 10 * 1000; // 10 seconds cooldown between rolls
        const currentTime = Date.now();
        let userData = await usersData.get(senderID);

        if (!userData.data.dices) {
            userData.data.dices = { count: 0, firstDice: currentTime, lastDicesTime: 0 };
        }

        const timeElapsed = currentTime - userData.data.dices.firstDice;

        if (timeElapsed >= diceTimeLimit) {
            userData.data.dices = { count: 0, firstDice: currentTime, lastDicesTime: 0 };
        }

        if (userData.data.dices.count >= maxlimit) {
            const timeLeft = diceTimeLimit - timeElapsed;
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return api.sendMessage(
                `❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐝𝐢𝐜𝐞 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐦𝐚𝐱𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦.`,
                event.threadID,
                event.messageID
            );
        }

        const timeSinceLastDices = currentTime - userData.data.dices.lastDicesTime;
        if (timeSinceLastDices < cooldownTime) {
            const waitTime = ((cooldownTime - timeSinceLastDices) / 1000).toFixed(1);
            return api.sendMessage(`⏳ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 ${waitTime} 𝐬𝐞𝐜𝐨𝐧𝐝𝐬 𝐛𝐞𝐟𝐨𝐫𝐞 diceing 𝐚𝐠𝐚𝐢𝐧.`, event.threadID, event.messageID);
        }

        let betAmount = parseInt(args[0]);

        if (isNaN(betAmount) || betAmount <= 0) {
            return api.sendMessage("❌ Please enter a valid bet amount!", event.threadID, event.messageID);
        }

        // Add the maximum bet amount condition here
        if (betAmount > 10000000) {
            return api.sendMessage("❌ | 𝐓𝐡𝐞 𝐦𝐚𝐱𝐢𝐦𝐮𝐦 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭 𝐢𝐬 𝟏𝟎𝐌.", event.threadID, event.messageID);
        }

        if (userData.money < betAmount) {
            return api.sendMessage("💰 You don't have enough money to place this bet!", event.threadID, event.messageID);
        }

        function rollDice() {
            return Math.floor(Math.random() * 6) + 1;
        }

        let playerRoll = rollDice();
        let botRoll = rollDice();

        userData.data.dices.count += 1;
        userData.data.dices.lastDicesTime = currentTime;
        await usersData.set(senderID, userData);

        if (playerRoll > botRoll) {
            userData.money += betAmount * 2;
            await usersData.set(senderID, userData);
            return api.sendMessage(
                `🎲 𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝: ${playerRoll} \n🤖 𝐁𝐨𝐭 𝐫𝐨𝐥𝐥𝐞𝐝: ${botRoll}\n\n• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatMoney(betAmount * 2)} ✨`,
                event.threadID,
                event.messageID
            );
        } else if (playerRoll < botRoll) {
            userData.money = Math.max(0, userData.money - betAmount);
            await usersData.set(senderID, userData);
            return api.sendMessage(
                `🎲 𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝: ${playerRoll} \n🤖 𝐁𝐨𝐭 𝐫𝐨𝐥𝐥𝐞𝐝: ${botRoll}\n\n• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 ${formatMoney(betAmount)} 🥺`,
                event.threadID,
                event.messageID
            );
        } else {
            return api.sendMessage(
                `🎲 𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝: ${playerRoll} \n🤖 𝐁𝐨𝐭 𝐫𝐨𝐥𝐥𝐞𝐝: ${botRoll}\n\n• 𝐈𝐭'𝐬 𝐚 𝐭𝐢𝐞! 𝐍𝐨 𝐦𝐨𝐧𝐞𝐲 𝐥𝐨𝐬𝐭.`,
                event.threadID,
                event.messageID
            );
        }
    }
};

// The new formatMoney function with units
function formatMoney(num) {
    const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"];
    let unit = 0;
    while (num >= 1000 && ++unit < units.length) num /= 1000;
    return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}
