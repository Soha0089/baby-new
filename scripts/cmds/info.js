const fs = require('fs');
const moment = require('moment-timezone');
const { MongoClient } = require('mongodb');
const axios = require('axios');

module.exports = {
  config: {
    name: "info",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "info"
  },

  onStart: async function ({ message, args }) {
    if (!message || message.replySent) return;

    if (args[0] === "add") {
      this.addUserInfo(message, args.slice(1).join(" "));
    } else if (args[0] === "list") {
      this.showUserList(message);
    } else {
      this.processInfoCommand(message, args);
    }
  },

  onChat: async function ({ event, message }) {
    if (message.replySent) return;

    if (event.body && event.body.toLowerCase().startsWith("inf")) {
      let args = event.body.split(" ");
      if (args[1] === "list") {
        this.showUserList(message);
      } else if (args[1] === "add") {
        this.addUserInfo(message, args.slice(2).join(" "));
      } else {
        this.processInfoCommand(message, args.slice(1));
      }
    }
  },

  processInfoCommand: async function (message, args) {
    let infoData = await this.loadInfoData();
    if (!infoData) return;

    if (args[0]) {
      const userIdOrName = args[0];
      const userInfo = infoData.users.find(user =>
        user.allowed_ids.some(userId =>
          userId.id === userIdOrName || userId.name.toLowerCase() === userIdOrName.toLowerCase()
        )
      );

      if (userInfo) {
        this.sendInfo(message, infoData, userIdOrName);
      } else {
        message.reply("⚠ No information found for this User ID or Name.");
      }
    } else {
      this.sendInfo(message, infoData, 'owner');
    }
  },

  showUserList: async function (message) {
    let infoData = await this.loadInfoData();
    if (!infoData || !infoData.users.length) {
      return message.reply("⚠ No user info found.");
    }

    let userList = infoData.users.map((user, index) => `${index + 1}. ${user.allowed_ids[0].name}`).join("\n");
    let finalMessage = `🎀 𝐔𝐬𝐞𝐫 𝐯𝐢𝐩 𝐢𝐧𝐟𝐨 𝐥𝐢𝐬𝐭:\n${userList}`;
    message.reply(finalMessage);
  },

  loadInfoData: async function () {
    try {
      let client = new MongoClient('mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0');
      await client.connect();
      const db = client.db('GoatBotV2');
      const collection = db.collection('userInfo');
      const data = await collection.find({}).toArray();
      client.close();
      return { users: data };
    } catch (err) {
      console.error("Error loading user info from MongoDB:", err);
      return null;
    }
  },

  sendInfo: async function (message, infoData, userType = null) {
    const now = moment().tz('Asia/Dhaka');
    const time = now.format('h:mm:ss A');
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}sec`;

    let userInfos = [];

    if (userType === 'owner') {
      userInfos.push(infoData.users[0]);
    } else if (userType === 'admin') {
      userInfos.push(infoData.users[1]);
    } else if (userType) {
      let userInfo = infoData.users.find(user =>
        user.allowed_ids.some(userId =>
          userId.id === userType || userId.name.toLowerCase() === userType.toLowerCase()
        )
      );
      if (userInfo) {
        userInfos.push(userInfo);
      }
    } else {
      userInfos = infoData.users.filter(user => !user.allowed_ids || user.allowed_ids.length === 0);
    }

    const fontData = JSON.parse(fs.readFileSync("style.json", "utf-8"));
    const fontStyle = fontData["11"];

    for (let userInfo of userInfos) {
      let finalMessage = userInfo.message;
      finalMessage = this.applyFontStyle(finalMessage, fontStyle);

      try {
        const response = await axios({
          method: "GET",
          url: userInfo.image,
          responseType: "stream",
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });
        message.reply({ body: finalMessage, attachment: response.data });
      } catch (error) {
        message.reply(finalMessage);
      }
    }
  },

  applyFontStyle: function (text, fontStyle) {
    return text.split('').map(char => fontStyle[char] || char).join('');
  },

  addUserInfo: async function (message, userData) {
    let parts = userData.split(" - ");

    if (parts.length < 4) {
      return message.reply("⚠ Incorrect format! Use: info add <uid> - <name> - <message> - <image_url>");
    }

    let newUser = {
      allowed_ids: [{ id: parts[0].trim(), name: parts[1].trim() }],
      message: parts[2].trim(),
      image: parts[3].trim()
    };

    const client = new MongoClient('mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0');
    try {
      await client.connect();
      const db = client.db('GoatBotV2');
      const collection = db.collection('userInfo');
      await collection.insertOne(newUser);
      message.reply(`✔ User info added successfully for ID/Name: ${parts[0].trim()}!`);
    } catch (err) {
      console.error("Error adding user info to MongoDB:", err);
      message.reply("⚠ Failed to add user info.");
    } finally {
      await client.close();
    }
  }
};
