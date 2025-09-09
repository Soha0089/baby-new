const axios = require("axios");

module.exports = {
  config: {
    name: "fluxpro",
    aliases: ["fluxproai", "fluxprogen"],
    version: "1.0",
    author: "MahMUD",
    countDown: 12,
    role: 0,
    category: "image",
    guide: { en: "{p}fluxpro [prompt]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = "highly detailed, photorealistic, " + args.join(" ");
    if (!args[0]) return api.sendMessage("❌ | Example: fluxpro cyberpunk mech robot", event.threadID, event.messageID);

    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent("fluxpro style, " + prompt)}?width=1024&height=1024&nologo=true`;
      await api.sendMessage({
        body: `⚡ FluxPro Prompt: ${args.join(" ")}`,
        attachment: await global.utils.getStreamFromURL(url)
      }, event.threadID, event.messageID);
    } catch {
      api.sendMessage("❌ | Failed to generate FluxPro image.", event.threadID, event.messageID);
    }
  }
};
