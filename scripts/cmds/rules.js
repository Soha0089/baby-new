const mongoose = require('mongoose');
const fs = require("fs");
const { getPrefix } = global.utils;

// Connect to MongoDB
mongoose.connect('mongodb+srv://rockx27:rockonx27fire@cluster0.e5kr5.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB:", err));

// Load font style
const fontData = JSON.parse(fs.readFileSync("style.json", "utf-8"));
const fontStyle = fontData["11"];

// Function to apply font style
function applyFontStyle(text, fontStyle) {
  return text.split('').map(char => fontStyle[char] || char).join('');
}

// Define Schema
const rulesSchema = new mongoose.Schema({
  threadID: { type: String, required: true },
  rules: { type: [String], default: [] }
});

// Avoid OverwriteModelError
const RulesModel = mongoose.models.Rules || mongoose.model('Rules', rulesSchema);

module.exports = {
  config: {
    name: "rules",
    version: "1.0",
    author: "NTKhang (modified by Mahmud)",
    countDown: 5,
    role: 0,
    description: "Manage group rules (create, view, edit, move, delete).",
    category: "box chat",
    guide: {
      en: "   {pn} [add | -a] <rule>: Add a rule."
        + "\n   {pn}: View all group rules."
        + "\n   {pn} [edit | -e] <n> <new rule>: Edit rule number n."
        + "\n   {pn} [move | -m] <n1> <n2>: Swap the positions of rules n1 and n2."
        + "\n   {pn} [delete | -d] <n>: Delete rule number n."
        + "\n   {pn} [remove | -r]: Remove all rules."
        + "\n\nExamples:"
        + "\n   {pn} add Do not spam."
        + "\n   {pn} edit 1 Do not spam messages in the group."
        + "\n   {pn} move 1 2"
        + "\n   {pn} delete 1"
        + "\n   {pn} remove"
    }
  },

  langs: {
    en: {
      noRules: "Your group has no rules. Use `%1rules add <rule>` to create one.",
      yourRules: ">🎀 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩 𝐫𝐮𝐥𝐞𝐬:\n\n%1",
      noPermission: "Only admins can use this command.",
      invalidNumber: "Please enter a valid rule number.",
      ruleNotExist: "Rule number %1 does not exist.",
      successAdd: "✅ Successfully added a new rule.",
      successEdit: "✅ Successfully updated rule %1 to:\n%2",
      successMove: "✅ Successfully swapped rule %1 and rule %2.",
      successDelete: "✅ Successfully deleted rule %1.",
      confirmRemove: "⚠ React to confirm the removal of all group rules.",
      successRemove: "✅ Successfully removed all rules.",
      noContent: "⚠ Please specify the content for the rule."
    }
  },

  onStart: async function ({ args, role, message, event, getLang }) {
    const { threadID, senderID } = event;
    const type = args[0];
    let rulesData = await RulesModel.findOne({ threadID });

    if (!rulesData) {
      rulesData = new RulesModel({ threadID });
      await rulesData.save();
    }

    if (!type) {
      // View rules
      const rules = rulesData.rules;
      if (rules.length === 0) {
        return message.reply(getLang("noRules", getPrefix(threadID)));
      }

      const rulesList = rules.map((rule, i) =>
        applyFontStyle(`${i + 1}. ${rule}`, fontStyle)
      ).join("\n");

      return message.reply(getLang("yourRules", rulesList));
    }

    if (["add", "-a"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermission"));
      const content = args.slice(1).join(" ");
      if (!content) return message.reply(getLang("noContent"));

      rulesData.rules.push(content);
      await rulesData.save();
      return message.reply(applyFontStyle(getLang("successAdd"), fontStyle));
    }

    if (["edit", "-e"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermission"));
      const index = parseInt(args[1]) - 1;
      if (isNaN(index) || index < 0 || index >= rulesData.rules.length) {
        return message.reply(getLang("ruleNotExist", args[1]));
      }

      const newContent = args.slice(2).join(" ");
      if (!newContent) return message.reply(getLang("noContent"));

      rulesData.rules[index] = newContent;
      await rulesData.save();
      return message.reply(applyFontStyle(getLang("successEdit", args[1], newContent), fontStyle));
    }

    if (["move", "-m"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermission"));
      const [pos1, pos2] = args.slice(1).map(n => parseInt(n) - 1);
      if (isNaN(pos1) || isNaN(pos2) || !rulesData.rules[pos1] || !rulesData.rules[pos2]) {
        return message.reply(getLang("ruleNotExist", pos1 + 1, pos2 + 1));
      }

      [rulesData.rules[pos1], rulesData.rules[pos2]] = [rulesData.rules[pos2], rulesData.rules[pos1]];
      await rulesData.save();
      return message.reply(applyFontStyle(getLang("successMove", pos1 + 1, pos2 + 1), fontStyle));
    }

    if (["delete", "-d"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermission"));
      const index = parseInt(args[1]) - 1;
      if (isNaN(index) || index < 0 || index >= rulesData.rules.length) {
        return message.reply(getLang("ruleNotExist", args[1]));
      }

      rulesData.rules.splice(index, 1);
      await rulesData.save();
      return message.reply(applyFontStyle(getLang("successDelete", args[1]), fontStyle));
    }

    if (["remove", "-r"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermission"));
      message.reply(getLang("confirmRemove"), (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          commandName: "rules",
          threadID,
          author: senderID
        });
      });
    }
  },

  onReaction: async function ({ event, Reaction, message, getLang }) {
    const { author, threadID } = Reaction;
    if (event.userID !== author) return;

    const rulesData = await RulesModel.findOne({ threadID });
    if (rulesData) {
      rulesData.rules = [];
      await rulesData.save();
    }

    return message.reply(applyFontStyle(getLang("successRemove"), fontStyle));
  }
};
