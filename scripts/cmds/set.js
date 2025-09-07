module.exports = {
  config: {
    name: "set",
    version: "1.0",
    author: "Loid Butter",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points for a user"
    },
    longDescription: {
      en: "Set coins and experience points for a user as desired"
    },
    category: "owner",
    guide: {
      en: "{pn}set [money|exp] [amount]"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const allowedUserIDs = ["61556006709662", "100083900196039"];
    
    if (!allowedUserIDs.includes(event.senderID)) {
      return api.sendMessage(
        `𝐂𝐨𝐦𝐦𝐚𝐧𝐝 "set" 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐞𝐱𝐢𝐬𝐭, 𝐭𝐲𝐩𝐞 !𝐡𝐞𝐥𝐩 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬`, 
        event.threadID, 
        event.messageID
      );
    }

    const query = args[0];
    const amount = parseInt(args[1]);

    if (!query || isNaN(amount)) {
      return api.sendMessage("Invalid command arguments. Usage: set [money|exp] [amount]", event.threadID);
    }

    const { senderID, threadID } = event;

    let targetUser;
    if (event.type === "message_reply") {
      targetUser = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions);
      targetUser = mention[0] || senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage("User not found.", threadID);
    }

    const name = await usersData.getName(targetUser);

    if (query.toLowerCase() === 'exp') {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });

      return api.sendMessage(`Set experience points to ${amount} for ${name}.`, threadID);
    } else if (query.toLowerCase() === 'money') {
      await usersData.set(targetUser, {
        money: amount,
        exp: userData.exp,
        data: userData.data
      });

      return api.sendMessage(`Set coins to ${amount} for ${name}.`, threadID);
    } else {
      return api.sendMessage("Invalid query. Use 'exp' to set experience points or 'money' to set coins.", threadID);
    }
  }
};