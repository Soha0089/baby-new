module.exports = {
  config: {
    name: "supportgc",
    aliases: ["joingc", "support"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "general",
    guide: {
      en: "{pn} - Join the official support group"
    }
  },

  onStart: async function ({ api, event, threadsData, message }) {
    const supportGroupThreadID = "7460623087375340";
    const userID = event.senderID;

    try {
      const { members } = await threadsData.get(supportGroupThreadID);
      const userInfo = await api.getUserInfo(userID);
      const senderName = event.senderName || userInfo[userID].name;

      const userAlreadyInGroup = members.some(
        member => member.userID === userID && member.inGroup
      );

      if (userAlreadyInGroup) {
        const alreadyInGroupMessage = `✅ | ${senderName}, You are already a member of 
🎀💙 [ YOUR BABY WORLD ] 😍🦋 group.

- Please follow the group rules & enjoy!
- For any issues, contact my owner:
• 👑 Owner: 𝐌𝐚𝐡 𝐌𝐔𝐃
• 🔗 Facebook: m.me/mahmud.x07`;
        return message.reply(alreadyInGroupMessage);
      }

      await api.addUserToGroup(userID, supportGroupThreadID);

      const successMessage = `╭─────────────◊
│ ✨ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ✨
│ [ YOUR BABY WORLD ]
╰─────────────◊

✅ You have been successfully added.
- Please follow the group rules & enjoy.
- For any issues, contact my owner:
• 👑 Owner: 𝐌𝐚𝐡 𝐌𝐔𝐃
• 🔗 Facebook: m.me/mahmud.x07`;
      return message.reply(successMessage);

    } catch (error) {
      console.error("❌ Error adding user to support group:", error);
      const failedMessage = `❌ | Unable to add you to [ YOUR BABY WORLD ] Group.

চাইলে এই লিঙ্ক ওপেন করে join হতে পারবেন:
• 🔗 Link: https://m.me/j/AbaI0vNvy8EjE1ek/`;
      return message.reply(failedMessage);
    }
  }
};