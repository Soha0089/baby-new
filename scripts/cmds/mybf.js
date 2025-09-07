const fs = require('fs');
const jimp = require("jimp");

module.exports.config = {
    name: "mybf",
    version: "2.0.0",
    role: 0,
    usePrefix: true,
    author: "dipto",
    description: "tag for couples",
    category: "love",
    usages: "[tag]",
    cooldowns: 5,
    dependencies: {
        "fs": "",
        "jimp": ""
    }
};

module.exports.onStart = async ({ event, api, args }) => {
    const { threadID, messageID, senderID } = event;
    var mention = Object.keys(event.mentions)[0] || event.messageReply.senderID;

    // Check if no one was tagged
    if (!mention) {
        return api.sendMessage("❌ Please tag 1 person or message reply.", threadID, messageID);
    }

    var two = senderID, one = mention;

    try {
        // Load background image and profile pictures
        let bg_img = await jimp.read("https://i.ibb.co/SPKQ98N/1000077201-01.jpg");
        let circleOne = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        let circleTwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    
        // Resize and add images to the background
        bg_img.resize(1030, 587).composite(circleOne.resize(279, 280).circle(), 109, 170).composite(circleTwo.resize(279, 280).circle(), 639, 170);
        
        // Save the result to a file
        let filePath = `./gf_${one}.png`;
        await bg_img.writeAsync(filePath);

        // Send the final image
        api.sendMessage({
            body: "𝗞𝗶𝗻𝗴 𝗮𝗻𝗱 𝗤𝘂𝗲𝗲𝗻 𝗔𝗿𝗲 𝗝𝗼𝗶𝗻𝗲𝗱 𝗶𝗻 𝗟𝗼𝘃𝗲 😘",
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
    } catch (error) {
        console.log(error);
        api.sendMessage("❌ An error occurred while processing the image. Please try again later.", threadID, messageID);
    }
};