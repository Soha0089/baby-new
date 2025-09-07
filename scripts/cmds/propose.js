const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "propose",
    aliases: ["proposal"],
    version: "1.1",
    author: "♡ 𝐍𝐚𝐳𝐫𝐮𝐥 ♡",
    countDown: 5,
    role: 0,
    shortDescription: "@mention someone to propose",
    longDescription: "",
    category: "fun",
    guide: "{pn} mention/tag"
  },

  onStart: async function ({ message, event, args }) {
    let one, two;
    const mention = Object.keys(event.mentions);

    // Check the mention length to determine which users are being targeted
    if (mention.length == 0) {
      return message.reply("Please mention someone");
    } else if (mention.length == 1) {
      one = event.senderID;
      two = mention[0];
    } else {
      one = mention[0];
      two = mention[1];
    }

    // Process the image and send the reply with the generated proposal
    bal(one, two).then(ptth => {
      message.reply({ body: "「 Please be mine😍❤ 」", attachment: fs.createReadStream(ptth) });
    });
  }
};

// Function to create the proposal image
async function bal(one, two) {
  // Fetching user avatars
  let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avone.circle();
  
  let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avtwo.circle();

  // Path to save the generated image
  let pth = "propose.png";
  
  // Read base image for the proposal
  let img = await jimp.read("https://i.ibb.co/RNBjSJk/image.jpg");

  // Resize and composite the avatars onto the base image
  img.resize(760, 506)
     .composite(avone.resize(90, 90), 210, 65)
     .composite(avtwo.resize(90, 90), 458, 105);

  // Write the final image to a file
  await img.writeAsync(pth);
  return pth;
}
