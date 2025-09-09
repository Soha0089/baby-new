const axios = require("axios");

module.exports = {
  config: {
    name: "fluxai",
    version: "1.0",
    author: "MahMUD",
    countDown: 12,
    role: 0,
    category: "image",
    guide: { en: "{p}flux [prompt]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ | Example: flux futuristic city at night", event.threadID, event.messageID);

    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent("flux style, " + prompt)}?width=1024&height=1024&nologo=true`;
      await api.sendMessage({
        body: `⚡ Flux Style Prompt: ${prompt}`,
        attachment: await global.utils.getStreamFromURL(url)
      }, event.threadID, event.messageID);
    } catch {
      api.sendMessage("❌ | Failed to generate Flux image.", event.threadID, event.messageID);
    }
  }
};
