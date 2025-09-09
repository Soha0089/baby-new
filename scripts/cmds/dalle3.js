const axios = require("axios");

module.exports = {
  config: {
    name: "dalle3",
    aliases: ["d3", "dallegen"],
    version: "1.0",
    author: "MahMUD",
    countDown: 12,
    role: 0,
    category: "image",
    guide: { en: "{p}dalle3 [prompt]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = "dalle3 style, " + args.join(" ");
    if (!args[0]) return api.sendMessage("❌ | Example: dalle3 futuristic city skyline at sunset", event.threadID, event.messageID);

    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
      await api.sendMessage({
        body: `🤖 DALL·E 3 Style Prompt: ${args.join(" ")}`,
        attachment: await global.utils.getStreamFromURL(url)
      }, event.threadID, event.messageID);
    } catch {
      api.sendMessage("❌ | Failed to generate DALL·E 3 style image.", event.threadID, event.messageID);
    }
  }
};
