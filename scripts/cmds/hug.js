module.exports = {
    config: {
        name: "hug",
        version: "3.1.1",
        author: "John Lester (Converted by RL)", // Both authors' names
        countDown: 5,
        role: 0,
        shortDescription: { en: "Hug 🥰" },
        description: { en: "Hug someone in the chat by replying or mentioning them." },
        category: "love",
        guide: { en: "Usage: @mention or reply to a user." },
        cooldowns: 5,
        dependencies: {
            "axios": "",
            "fs-extra": "",
            "path": "",
            "jimp": ""
        }
    },

    onStart: async function ({ event, api, args, message, threadData, userData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
        const fs = require("fs-extra");
        const { threadID, messageID, senderID } = event;
        let one, two;
        const mention = Object.keys(event.mentions);

        // If no one is mentioned, return a message asking for a mention
        if (mention.length == 0) {
            return message.reply("Please mention someone");
        }
        // If exactly one person is mentioned, assign senderID to `one` and the mentioned user's ID to `two`
        else if (mention.length == 1) {
            one = senderID;
            two = mention[0];
        }
        // If two people are mentioned, assign accordingly
        else {
            one = mention[0];
            two = mention[1];
        }

        // If no targetID (either through reply or mention) exists, notify the user
        const targetID = two;
        if (!targetID) {
            return api.sendMessage(getLang("pleaseMentionOrReply"), threadID, messageID);
        }

        // Generate the hug image and send it as a reply
        try {
            console.log("Generating hug image for", one, "and", two); // Log IDs for debugging
            const path = await this.makeImage({ one, two });
            console.log("Generated hug image at:", path); // Log the image path for debugging
            api.sendMessage({
                body: "𝐈'𝐦 𝐟𝐞𝐞𝐥𝐢𝐧𝐠 𝐟𝐨𝐫 𝐲𝐨𝐮 𝐛𝐚𝐛𝐲 <😘",
                attachment: fs.createReadStream(path)
            }, threadID, () => fs.unlinkSync(path), messageID);
        } catch (error) {
            console.error("Error generating hug image:", error); // Log the error
            api.sendMessage("An error occurred while trying to generate the hug image. Please try again later.", threadID, messageID);
        }
    },

    makeImage: async function ({ one, two }) {
        const fs = require("fs-extra");
        const path = require("path");
        const axios = require("axios");
        const jimp = require("jimp");
        const __root = path.resolve(__dirname, "cache", "canvas");

        // Ensure the hug image is present
        try {
            console.log("Checking for hug image template...");
            if (!fs.existsSync(__root + "/hugv2.png")) {
                console.log("Downloading hug image template...");
                await this.downloadFile("https://i.ibb.co/zRdZJzG/1626342271-28-kartinkin-com-p-anime-obnimashki-v-posteli-anime-krasivo-30.jpg", __root + "/hugv2.png");
            }
        } catch (error) {
            console.error("Error with template image:", error);
            throw error; // Throw error to stop the process
        }

        try {
            console.log("Loading hug template image...");
            let batgiam_img = await jimp.read(__root + "/hugv2.png");
            let pathImg = __root + `/batman${one}_${two}.png`;
            let avatarOne = __root + `/avt_${one}.png`;
            let avatarTwo = __root + `/avt_${two}.png`;

            // Download and save the avatars
            await this.downloadAvatar(one, avatarOne);
            await this.downloadAvatar(two, avatarTwo);

            console.log("Processing avatars into circular images...");
            let circleOne = await jimp.read(await this.circle(avatarOne));
            let circleTwo = await jimp.read(await this.circle(avatarTwo));

            // Add avatars to the hug image
            batgiam_img.composite(circleOne.resize(100, 100), 370, 40).composite(circleTwo.resize(100, 100), 330, 150);

            let raw = await batgiam_img.getBufferAsync("image/png");
            fs.writeFileSync(pathImg, raw);
            fs.unlinkSync(avatarOne);
            fs.unlinkSync(avatarTwo);

            console.log("Avatar processing complete, returning image path.");
            return pathImg;
        } catch (error) {
            console.error("Error generating the hug image:", error);
            throw error; // Rethrow error so it can be caught in onStart
        }
    },

    // Function to download an avatar
    downloadAvatar: async function (userId, avatarPath) {
        const fs = require("fs-extra");
        const axios = require("axios");
        try {
            console.log(`Downloading avatar for user ${userId}...`);
            let avatar = (await axios.get(`https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
            fs.writeFileSync(avatarPath, Buffer.from(avatar, 'utf-8'));
        } catch (error) {
            console.error(`Error downloading avatar for user ${userId}:`, error);
            throw error; // Stop execution if avatar download fails
        }
    },

    // Function to convert image to circle
    circle: async function (image) {
        const jimp = require("jimp");
        image = await jimp.read(image);
        image.circle();
        return await image.getBufferAsync("image/png");
    },

    // Function to download a file from a URL
    downloadFile: async function (url, destinationPath) {
        const axios = require("axios");
        const fs = require("fs-extra");
        try {
            console.log(`Downloading file from ${url}...`);
            let response = await axios.get(url, { responseType: 'arraybuffer' });
            fs.writeFileSync(destinationPath, Buffer.from(response.data, 'utf-8'));
        } catch (error) {
            console.error(`Error downloading file from ${url}:`, error);
            throw error; // Throw error to stop execution if download fails
        }
    }
};
