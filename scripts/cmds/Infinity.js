const axios = require("axios");

module.exports = {
  config: {
    name: "infinity",
    aliases: ["infinityai", "infgen"],
    version: "1.0",
    author: "MahMUD",
    countDown: 12,
    role: 0,
    category: "image",
    guide: { en: "{p}infinity [prompt]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = "ultra hd, cinematic, " + args.join(" ");
    if (!args[0]) return api.sendMessage("❌ | Example: infinity futuristic castle on cloud", event.threadID, event.messageID);

    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent("infinity style, " + prompt)}?width=1024&height=1024&nologo=true`;
      await api.sendMessage({
        body: `♾️ Infinity Prompt: ${args.join(" ")}`,
        attachment: await global.utils.getStreamFromURL(url)
      }, event.threadID, event.messageID);
    } catch {
      api.sendMessage("❌ | Failed to generate Infinity image.", event.threadID, event.messageID);
    }
  }
};
