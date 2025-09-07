const axios = require("axios");

const commandAliases = {
  "-r": "random",
};

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mix"],
    version: "1.8",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    guide: "{pn} <emoji1> <emoji2>\n{pn} random | {pn} -r\nExample: {pn} 🙂 😘",
    category: "fun"
  },

  langs: {
    en: {
      error: "❌ Sorry, emoji %1 and %2 can't be mixed or are not supported.",
      success: "✅ Emoji %1 and %2 mixed successfully!"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    let emoji1, emoji2;
    const emojiList = [
      "🙂", "😘", "😂", "😎", "🥺", "🔥", "💀", "🤡", "😇", "👻",
      "😜", "😍", "😡", "🤔", "😴", "🥶", "😱", "🤑", "🤖", "👽",
      "🐶", "🐱", "🐵", "🐸", "🐼", "🐧", "🦊", "🐻", "🐯", "🐰",
      "❤", "💔", "❣", "💕", "💖", "💩", "⭐", "🌈", "⚡", "☀",
      "🌙", "🍕", "🍔", "🍟", "🍩", "🍉", "🍇", "🍓", "🥑", "🍒",
      "🥵", "🥳", "😐", "😶", "😩", "😤", "😬", "😷", "🤒", "🤕",
      "🫠", "🫥", "🫣", "🥹", "🫶", "👀", "🧠", "👑", "🎩", "🎃",
      "🌟", "☁", "⛄", "⚽", "🏀", "🎮", "🎲", "🎸", "🕹", "🎁"
    ];

    const input = args.join("").trim();

    if (!input || input.toLowerCase() === "random" || input === "-r") {
      emoji1 = emojiList[Math.floor(Math.random() * emojiList.length)];
      emoji2 = emojiList[Math.floor(Math.random() * emojiList.length)];
      while (emoji2 === emoji1) {
        emoji2 = emojiList[Math.floor(Math.random() * emojiList.length)];
      }
    } else {
      const emojis = [...input]; // Properly separates emojis
      emoji1 = emojis[0];
      emoji2 = emojis[1];
    }

    const image = await generateEmojimix(emoji1, emoji2);
    if (!image) return message.reply(getLang("error", emoji1 || "❓", emoji2 || "❓"));

    return message.reply({
      body: `${getLang("success", emoji1, emoji2)}\n→ ${emoji1} + ${emoji2}`,
      attachment: image
    });
  }
};

async function generateEmojimix(emoji1, emoji2) {
  try {
    const apiUrl = `${await baseApiUrl()}/api/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
    const response = await axios.get(apiUrl, {
      headers: { "Author": module.exports.config.author },
      responseType: "stream"
    });

    if (response.data.error) return null;
    return response.data;
  } catch (err) {
    console.error("❌ API Error:", err.message);
    return null;
  }
}