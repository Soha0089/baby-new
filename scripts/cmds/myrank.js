function expToLevel(exp, deltaNextLevel = 5) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
}

// Function to format money with K, M, B, etc.
function formatMoney(num) {
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
  let unit = 0;

  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }

  return Number(num.toFixed(1)) + units[unit];
}

module.exports = {
  config: {
    name: "myrank",
    aliases: ["ownrank"],
    version: "1.0",
    role: 0,
    author: "Mahmud",
    description: "Show user rank and level only",
    category: "general",
    countDown: 5
  },

  onStart: async function ({ event, message, usersData, args }) {
    const uid = args[0] && /^\d+$/.test(args[0])
      ? args[0]
      : event.type === "message_reply"
        ? event.messageReply.senderID
        : Object.keys(event.mentions)[0] || event.senderID;

    const allUsers = await usersData.getAll();
    const sortedUsers = allUsers.sort((a, b) => b.exp - a.exp);
    const userData = sortedUsers.find(user => String(user.userID) === String(uid));
    const userIndex = sortedUsers.findIndex(user => String(user.userID) === String(uid));

    const userExp = userData?.exp || 0;
    const userLevel = expToLevel(userExp);
    const overallRank = userIndex >= 0 ? userIndex + 1 : "Not ranked";

    const userName = userData?.name || await usersData.getName(uid);

    const replyText = `╭── [ 𝐔𝐬𝐞𝐫 𝐑𝐚𝐧𝐤 ]
├‣ Name: ${userName}
├‣ 𝐑𝐚𝐧𝐤 𝐋𝐞𝐯𝐞𝐥: ${userLevel}
├‣ 𝐑𝐚𝐧𝐤 𝐞𝐱𝐩: ${formatMoney(userExp)}
╰‣ 𝐑𝐚𝐧𝐤 𝐓𝐨𝐩: ${overallRank}`;

    message.reply(replyText);
  }
};