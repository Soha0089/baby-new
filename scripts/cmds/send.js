module.exports = {
  config: {
    name: "send",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    shortDescription: {
      en: "Send money to another user",
    },
    longDescription: {
      en: "Send money to another user using their UID, mention, or by replying to their message. The amount is specified at the end of the command.",
    },
    category: "economy",
  },
  langs: {
    en: {
      invalid_amount: "❎ Please specify a valid amount to send.",
      not_enough_money: "❎ You don't have enough money to send.",
      invalid_user: "❎ The specified user is invalid or not found.",
      transfer_success: "✅ | Successfully sent %1 to %2.",
      transfer_fail: "❌ | Failed to send money. Please check the user and try again.",
      thread_only: "❌ 𝐎𝐧𝐥𝐲 𝐛𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩 𝐰𝐨𝐫𝐤 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.\n\n𝐓𝐲𝐩𝐞 !joingc 𝐚𝐝𝐝 𝐭𝐨 𝐛𝐨𝐭 𝐬𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩.",
      self_transfer: "❎ You cannot send money to yourself.",
      invalid_command: "❎ Invalid command. Example: !send money @mention 100$",
    },
  },

  // Convert to short money format
  formatMoney: function (num) {
    const units = ["", "𝐊", "𝐌", "B", "T"];
    let unit = 0;
    while (num >= 1000 && unit < units.length - 1) {
      num /= 1000;
      unit++;
    }
    return Number(num.toFixed(1)) + units[unit];
  },

  // Convert to bold numbers
  toBoldNumbers: function (number) {
    const bold = { "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗" };
    return number.toString().split('').map(c => bold[c] || c).join('');
  },

  // Convert name to bold text
  toBoldUnicode: function (text) {
    const bold = {
      "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
      "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
      "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳",
      "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃", "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉",
      "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍", "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓",
      "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗", "Y": "𝐘", "Z": "𝐙", " ": " ", "'": "'", ",": ",", ".": ".", "-": "-"
    };
    return text.split('').map(c => bold[c] || c).join('');
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID, mentions, messageReply, threadID } = event;
    const allowedThreadID = "7460623087375340"; // Allowed thread ID
    let recipientID, amount;

    const commandAliases = {
      "-m": "money",
    };

    if (!args[0]) {
      return message.reply(getLang("invalid_command"));
    }

    let command = args[0].toLowerCase();
    if (commandAliases[command]) {
      command = commandAliases[command];
    }

    switch (command) {
      case "money":
        if (threadID !== allowedThreadID) {
          return message.reply(getLang("thread_only"));
        }

        amount = parseInt(args[args.length - 1]);
        if (isNaN(amount) || amount <= 0) {
          return message.reply(getLang("invalid_amount"));
        }

        if (messageReply && messageReply.senderID) {
          recipientID = messageReply.senderID;
        } else if (mentions && Object.keys(mentions).length > 0) {
          recipientID = Object.keys(mentions)[0];
        } else if (args.length > 2) {
          recipientID = args[1];
        } else {
          return message.reply("❎ Please provide a user by replying to their message, mentioning them, or entering their UID.");
        }

        if (recipientID === senderID) {
          return message.reply(getLang("self_transfer"));
        }

        const recipientData = await usersData.get(recipientID);
        if (!recipientData) {
          return message.reply(getLang("invalid_user"));
        }

        const senderData = await usersData.get(senderID);
        const senderBalance = senderData.money || 0;

        if (amount > senderBalance) {
          return message.reply(getLang("not_enough_money"));
        }

        const recipientBalance = recipientData.money || 0;

        try {
          await usersData.set(senderID, { money: senderBalance - amount });
          await usersData.set(recipientID, { money: recipientBalance + amount });

          const formattedAmount = this.toBoldNumbers(this.formatMoney(amount));
          const recipientName = this.toBoldUnicode(recipientData.name || "Unknown User");

          return message.reply(getLang("transfer_success", formattedAmount, recipientName));
        } catch (error) {
          console.error(error);
          return message.reply(getLang("transfer_fail"));
        }
      default:
        return message.reply(getLang("invalid_command"));
    }
  },
};
