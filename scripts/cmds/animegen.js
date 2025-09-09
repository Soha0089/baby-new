const axios = require("axios");

module.exports = {
  config: {
    name: "animegen",
    aliases: ["aigen", "animedraw"],
    version: "1.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "image",
    guide: { en: "{p}animegen [prompt]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = "anime style, " + args.join(" ");
    if (!args[0]) return api.sendMessage("❌ | Example: animegen cute girl with sword", event.threadID, event.messageID);
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
      await api.sendMessage({
        body: `✨ | Anime Prompt: ${args.join(" ")}`,
        attachment: await global.utils.getStreamFromURL(url)
      }, event.threadID, event.messageID);
    } catch {
      api.sendMessage("❌ | Failed to generate anime image.", event.threadID, event.messageID);
    }
  }
};
