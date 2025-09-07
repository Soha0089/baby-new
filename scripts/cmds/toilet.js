const jimp = require('jimp');
const fs = require('fs');

module.exports.config = {
	name: "toilet",
	version: "1.0.2",
	role: 0,
	author: "Mah MUD",
	description: "toilet photo",
	usePrefix: true, 
	category: "fun", 
	usages: "[mention]",
	cooldowns: 5,
};

module.exports.onStart = async ({ event, api }) => {
	 
	  try {
		const id = Object.keys(event.mentions)[0] || event.senderID;
		console.log(id)
		if (id === "61556006709662") {
			return api.sendMessage("who are you 🐸", event.threadID, event.messageID);
		}
		const background = await jimp.read('https://telegra.ph/file/2fc2143b2d02b7d723ccf.jpg');
		
		let avatar = await jimp.read(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

		avatar.resize(128, 128).circle();
		background.composite(avatar, 75, 170);
		const filePath = `./toilet_${id}.png`;
		await background.writeAsync(filePath);
		const attachment = fs.createReadStream(filePath);
		api.sendMessage({ attachment, body: "Here's your toilet image🐸🐸" }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
	} catch (e) {
		api.sendMessage(e.message, event.threadID, event.messageID);
	}
};