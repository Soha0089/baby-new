module.exports = {
    config: {
        name: "kissgf",
        version: "2.0.0",
        author: "Mahmud x leon",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Kiss someone you tagged"
        },
        description: {
            en: "Send a kiss image with tagged person's avatar"
        },
        category: "love",
        guide: {
            en: "kiss [tag]"
        }
    },

    onLoad: async function () {
        const { resolve } = require("path");
        const { existsSync, mkdirSync, writeFileSync } = require("fs-extra");
        const axios = require("axios");
        const dirMaterial = resolve(__dirname, "cache");
        const imagePath = resolve(dirMaterial, "hon0.jpeg");

        if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
        if (!existsSync(imagePath)) {
            const { data } = await axios.get("https://i.imgur.com/j96ooUs.jpeg", { responseType: "arraybuffer" });
            writeFileSync(imagePath, data);
        }
    },

    makeImage: async function ({ one, two }) {
        const fs = require("fs-extra");
        const path = require("path");
        const axios = require("axios"); 
        const jimp = require("jimp");
        const __root = path.resolve(__dirname, "cache");

        let hon_img = await jimp.read(path.join(__root, "hon0.jpeg"));
        let pathImg = path.join(__root, `hon0_${one}_${two}.jpeg`);
        let avatarOne = path.join(__root, `avt_${one}.png`);
        let avatarTwo = path.join(__root, `avt_${two}.png`);

        let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

        let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

        let circleOne = await jimp.read(await this.circle(avatarOne));
        let circleTwo = await jimp.read(await this.circle(avatarTwo));
        hon_img.resize(700, 440).composite(circleOne.resize(150, 150), 390, 23).composite(circleTwo.resize(150, 150), 115, 130);

        let raw = await hon_img.getBufferAsync("image/png");

        fs.writeFileSync(pathImg, raw);
        fs.unlinkSync(avatarOne);
        fs.unlinkSync(avatarTwo);

        return pathImg;
    },

    circle: async function (image) {
        const jimp = require("jimp");
        image = await jimp.read(image);
        image.circle();
        return await image.getBufferAsync("image/png");
    },

    onStart: async function ({ api, event, args, Currencies }) { 
        const fs = require("fs-extra");
        const hc = Math.floor(Math.random() * 101);
        const rd = Math.floor(Math.random() * 100000) + 100000;
        const { threadID, messageID, senderID } = event;
        
        let one, two;
        const mention = Object.keys(event.mentions);
        
        // Check mentions and assign values to `one` and `two`
        if (mention.length == 0) {
            return api.sendMessage("Please mention someone", threadID, messageID);
        } else if (mention.length == 1) {
            one = senderID;
            two = mention[0]; // If only one person is mentioned, pair with the sender
        } else {
            one = mention[0]; // First mentioned user
            two = mention[1]; // Second mentioned user
        }

        // Currency logic
        if (Currencies && Currencies.increaseMoney) {
            await Currencies.increaseMoney(event.senderID, parseInt(hc * rd));
        } else {
            console.warn("Currencies module is missing or increaseMoney method not available.");
        }

        return this.makeImage({ one, two }).then(path => {
            api.sendMessage({
                body: `𝐔𝐦𝐦𝐦𝐚𝐡 𝐛𝐚𝐛𝐲 <😘`, 
                attachment: fs.createReadStream(path)
            }, threadID, () => fs.unlinkSync(path), messageID);
        });
    }
};
