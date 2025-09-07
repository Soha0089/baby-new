const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const { MongoClient } = require("mongodb");

const uri = 'mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'vipUser';

let db;
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = {
  config: {
    name: "gay",
    version: "1.1",
    author: "@tas33n",
    countDown: 1,
    role: 0,
    shortDescription: "Add gay flag to an image",
    longDescription: "Apply a gay flag filter to an avatar or a replied image.",
    category: "fun",
    guide: "{pn} {{[on | off]}}",
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn áp dụng cờ lục sắc.",
      notVIP: "Bạn không phải là VIP, chỉ VIP mới được dùng lệnh này!"
    },
    en: {
      noTag: "You must tag the person you want to apply the rainbow flag to.",
      notVIP: "🥹 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚 𝐕𝐈𝐏 𝐮𝐬𝐞𝐫"
    }
  },

  onStart: async function ({ event, api, message, usersData, args, getLang }) {
    // Check if db is initialized
    if (!db) {
      return message.reply("❌ | Database connection is not initialized.");
    }

    // VIP check function
    const checkVip = async (uid) => {
      const collection = db.collection("vipUser");  // Ensure the collection is correctly named
      const user = await collection.findOne({ uid });
      return user && user.expiredAt > new Date();
    };

    // Check if the sender is a VIP
    const isVip = await checkVip(event.senderID);
    if (!isVip) {
      return message.reply("❌ | 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐍𝐨𝐭 𝐚 𝐯𝐢𝐩 𝐮𝐬𝐞𝐫 𝐛𝐚𝐛𝐲\n\n𝐓𝐲𝐩𝐞 !vip & 𝐬𝐞𝐞 𝐯𝐢𝐩 𝐩𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐭𝐚𝐬𝐤.");
    }

    let uid;
    let imageURL;

    // Check if the message is a reply
    if (event.type == "message_reply") {
      const reply = event.messageReply;
      
      // Check if the replied message contains an image
      if (reply.attachments && reply.attachments.length > 0 && reply.attachments[0].type === 'photo') {
        imageURL = reply.attachments[0].url;  // Get the image URL from the reply
      } else {
        uid = reply.senderID;  // Fallback to the sender's avatar if no image is found
        imageURL = await usersData.getAvatarUrl(uid);
      }
    } else {
      // If no reply, check if a user is mentioned, otherwise use the sender's avatar
      let mention = Object.keys(event.mentions);
      if (mention[0]) {
        uid = mention[0];
        imageURL = await usersData.getAvatarUrl(uid);
      } else {
        uid = event.senderID;
        imageURL = await usersData.getAvatarUrl(uid);
      }
    }

    try {
      // Apply the gay filter to the image or avatar
      let gayImage = await new DIG.Gay().getImage(imageURL);

      // Save the image temporarily
      const pathSave = `${__dirname}/tmp/gay.png`;
      fs.writeFileSync(pathSave, Buffer.from(gayImage));

      let body = "Look... I found a gay!";
      if (!uid) body = "Baka, you're gay. You forgot to reply or mention someone.";

      // Send the modified image with the rainbow flag
      message.reply({
        body: body,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave)); // Clean up the file after sending
    } catch (error) {
      console.error("Error generating image: ", error);
      message.reply("Sorry, something went wrong when generating the image.");
    }
  }
};
