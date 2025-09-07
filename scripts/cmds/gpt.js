const axios = require("axios");
const fetch = require("node-fetch");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "gpt",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage("⚠️ Please provide a question.", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const apiUrl = `${await baseApiUrl()}/api/gpt`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query })
      });

      const data = await response.json();

      if (data.error) {
        return api.sendMessage(`❌ ${data.error}`, event.threadID, event.messageID);
      }

      api.sendMessage(data.response || "⚠️ Sorry, no response from the AI.", event.threadID, event.messageID);
    } catch (error) {
      console.error("GPT Error:", error);
      api.sendMessage("❌ An error occurred while fetching the AI response.", event.threadID, event.messageID);
    }
  }
};