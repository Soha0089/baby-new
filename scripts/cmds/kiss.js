const jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "kiss",
        version: "1.3",
        author: "Mah MUD彡",
        countDown: 5,
        role: 0,
        shortDescription: "Kiss someone using anime template",
        longDescription: "",
        category: "love",
        guide: "{pn} @mention"
    },

    onStart: async function ({ message, event }) {
        const mention = Object.keys(event.mentions);
        if (mention.length === 0) return message.reply("Please mention someone to kiss.");
        
        const one = event.senderID;
        const two = mention[0];

        const imgPath = await createKissImage(one, two);
        message.reply({
            body: "✨𝗛𝗬 𝗧𝗛𝗜𝗦 𝗜𝗦 𝗙𝗢𝗥 𝗬𝗢𝗨✨",
            attachment: fs.createReadStream(imgPath)
        });
    }
};

async function createKissImage(one, two) {
    const outputPath = path.join(__dirname, `kiss_${one}_${two}.png`);

    const baseImgLink = "https://i.imgur.com/Suqb4yh.jpeg";
    const img = await jimp.read(baseImgLink);

    const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;

    const avOne = await jimp.read(getAvatarOne);
    avOne.circle();
    const avTwo = await jimp.read(getAvatarTwo);
    avTwo.circle();

    avOne.resize(80, 80);
    avTwo.resize(80, 80);

    img.composite(avOne, 130, 90);
    img.composite(avTwo, 320, 120);

    await img.writeAsync(outputPath);
    return outputPath;
}
