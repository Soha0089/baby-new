const axios = require("axios");

module.exports = {
  config: {
    name: "artgen",
   version: "1.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "image",
    guide: { en: "{p}artgen [prompt]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = "digital painting, concept art, " + args.join(" ");
    if (!args[0]) return api.sendMessage("❌ | Example: artgen dragon flying over castle", event.threadID, event.messageID);
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
      await api.sendMessage({
        body: `🖌️ | Art Prompt: ${args.join(" ")}`,
        attachment: await global.utils.getStreamFromURL(url)
      }, event.threadID, event.messageID);
    } catch {
      api.sendMessage("❌ | Failed to generate art image.", event.threadID, event.messageID);
    }
  }
};
