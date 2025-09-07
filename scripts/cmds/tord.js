const fs = require('fs');

module.exports = {
  config: {
    name: "tord",
    aliases: ["td", "truthordare"],
version: "1.9",
    author: "MahMUD",
    role: 0,
    category: "game",
    description: "Play Truth or Dare, add new questions, or view total question count.",
    usage: "[truth/dare] | add [truth/dare] [question] | list"
  },

  onStart: async function ({ api, event, args }) {
    let questions;
    try {
      questions = JSON.parse(fs.readFileSync("questions.json", "utf-8"));
    } catch (error) {
      return api.sendMessage("⚠️ | Error reading questions file.", event.threadID, event.messageID);
    }

    if (!args.length) {
      return api.sendMessage("⚠️ | Usage: !tord truth | !tord dare | !tord add truth/dare [question] | !tord list", event.threadID, event.messageID);
    }

    const subCommand = args[0]?.toLowerCase();

    if (subCommand === "add") {
      const type = args[1]?.toLowerCase();
      if (!type || (type !== "truth" && type !== "t" && type !== "dare" && type !== "d")) {
        return api.sendMessage("⚠️ | Please use: !tord add truth [question] or !tord add dare [question]", event.threadID, event.messageID);
      }

      const newQuestion = args.slice(2).join(" ");
      if (!newQuestion) {
        return api.sendMessage("⚠️ | Please provide a question.", event.threadID, event.messageID);
      }

      if (!questions[type === "t" || type === "truth" ? "truth" : "dare"]) {
        questions[type === "t" || type === "truth" ? "truth" : "dare"] = [];
      }
      questions[type === "t" || type === "truth" ? "truth" : "dare"].push(newQuestion);
      fs.writeFileSync("questions.json", JSON.stringify(questions, null, 2), "utf-8");

      return api.sendMessage(`✅ | Added new ${type === "t" || type === "truth" ? "truth" : "dare"} question: "${newQuestion}"`, event.threadID, event.messageID);
    }

    if (subCommand === "list") {
      const truthCount = questions.truth ? questions.truth.length : 0;
      const dareCount = questions.dare ? questions.dare.length : 0;
      return api.sendMessage(`📃| Total Truth questions: ${truthCount}\n📃| Total Dare questions: ${dareCount}`, event.threadID, event.messageID);
    }

    if (subCommand === "truth" || subCommand === "t") {
      if (!questions.truth || questions.truth.length === 0) {
        return api.sendMessage(`⚠️ | No truth questions available. Add some using !tord add truth [question]`, event.threadID, event.messageID);
      }

      const question = questions.truth[Math.floor(Math.random() * questions.truth.length)];
      return api.sendMessage(`>🎀 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐭𝐫𝐮𝐭𝐡: \n\n${question}`, event.threadID, event.messageID);
    }

    if (subCommand === "dare" || subCommand === "d") {
      if (!questions.dare || questions.dare.length === 0) {
        return api.sendMessage(`⚠️ | No dare questions available. Add some using !tord add dare [question]`, event.threadID, event.messageID);
      }

      const question = questions.dare[Math.floor(Math.random() * questions.dare.length)];
      return api.sendMessage(`>🎀 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐝𝐚𝐫𝐞: \n\n${question}`, event.threadID, event.messageID);
    }

    return api.sendMessage("❌ | Invalid command. Use !tord truth | !tord dare", event.threadID, event.messageID);
  }
};