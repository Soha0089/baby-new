const axios = require('axios');

module.exports = {
  config: {
    name: "math",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "general",
    shortDescription: {
      en: "Solve math",
    },
    longDescription: {
      en: "Solve math using the math.js API.",
    },
    guide: {
      en: "{pn} <expression>",
    },
  },

  onStart: async function ({ message, args }) {
    try {
      const expression = args.join(' ');

      if (!expression) {
        message.reply("Please provide a mathematical expression to evaluate.");
        return;
      }

      const apiUrl = `http://api.mathjs.org/v4/?expr=${encodeURIComponent(expression)}`;
      const response = await axios.get(apiUrl);

      if (response.status === 200 && response.data) {
        const result = parseFloat(response.data);

        if (!isNaN(result)) {
          message.reply(`╭‣The result of ${expression}\n╰‣is: ${result}`);
        } else {
          message.reply("Invalid mathematical expression.");
        }
      } else {
        message.reply("Error processing your request.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      message.reply("An error occurred while evaluating the expression.");
    }
  },
};