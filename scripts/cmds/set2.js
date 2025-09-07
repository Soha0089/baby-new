module.exports = {
  config: {
    name: "set2",
    version: "1.2",  // Updated version
    author: "Loid Butter",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points for one or more users"
    },
    longDescription: {
      en: "Set coins and experience points for one or more users as desired"
    },
    category: "admin",
    guide: {
      en: "{pn}set [money|exp] [amount] [uid1] [uid2] [...]"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const permission = global.GoatBot.config.DEV;
    if (!permission.includes(event.senderID)) {
      api.sendMessage("You don't have enough permission to use this command. Only My Lord Can Use It.", event.threadID, event.messageID);
      return;
    }

    const query = args[0];  // "money" or "exp"
    const amount = parseInt(args[1]);  // Amount to set
    const uids = args.slice(2);  // User IDs passed as arguments

    // Validate the arguments
    if (!query || !amount || uids.length === 0) {
      return api.sendMessage("Invalid command arguments. Usage: set [money|exp] [amount] [uid1] [uid2] [...]", event.threadID);
    }

    const { messageID, senderID, threadID } = event;

    // Prevent users from modifying their own data
    if (senderID === api.getCurrentUserID()) return;

    // Process each user ID
    for (let uid of uids) {
      let targetUser = uid || (event.type === "message_reply" ? event.messageReply.senderID : Object.keys(event.mentions)[0] || senderID);

      // Fetch user data
      const userData = await usersData.get(targetUser);
      if (!userData) {
        return api.sendMessage(`User with ID ${targetUser} not found.`, threadID);
      }

      const name = await usersData.getName(targetUser);

      // Handle setting experience points
      if (query.toLowerCase() === 'exp') {
        await usersData.set(targetUser, {
          money: userData.money,
          exp: amount,
          data: userData.data
        });

        api.sendMessage(`Set experience points to ${amount} for ${name}.`, threadID);
      }
      // Handle setting coins
      else if (query.toLowerCase() === 'money') {
        await usersData.set(targetUser, {
          money: amount,
          exp: userData.exp,
          data: userData.data
        });

        api.sendMessage(`Set coins to ${amount} for ${name}.`, threadID);
      } else {
        return api.sendMessage("Invalid query. Use 'exp' to set experience points or 'money' to set coins.", threadID);
      }
    }
  }
};
