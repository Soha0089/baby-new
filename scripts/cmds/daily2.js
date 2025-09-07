const fs = require("fs");
const moment = require("moment-timezone");

// Load font styles from style.json
const fontData = JSON.parse(fs.readFileSync("style.json", "utf-8"));
const fontStyle = fontData["11"]; // Using font style "11"

// Function to apply font style
function applyFontStyle(text, fontStyle) {
  return text.split('').map(char => fontStyle[char] || char).join('');
}

module.exports = {
	config: {
		name: "daily",
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: "Receive daily gift",
		category: "game",
		guide: "{pn}\n{pn} info: View daily gift information",
		envConfig: {
			rewardFirstDay: {
				coin: 1000, // First day's coin
				exp: 10     // First day's EXP (EXP system will be different)
			}
		}
	},

	langs: {
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "You have already received the gift",
			received: "You have received %1 coin and %2 exp"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;
		if (args[0] == "info") {
			let msg = "";
			for (let i = 1; i < 8; i++) {
				const getCoin = reward.coin * i;
				const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** (i - 1));

				const day = i == 7 ? getLang("sunday") :
					i == 6 ? getLang("saturday") :
						i == 5 ? getLang("friday") :
							i == 4 ? getLang("thursday") :
								i == 3 ? getLang("wednesday") :
									i == 2 ? getLang("tuesday") :
										getLang("monday");

				// Formatting the message with special symbols
				msg += applyFontStyle(`╭‣${day}: ${getCoin} coin\n╰──‣${getExp} exp\n`, fontStyle);
			}
			return message.reply(msg);
		}

		const dateTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
		const date = new Date();
		const currentDay = date.getDay();
		const { senderID } = event;

		const userData = await usersData.get(senderID);
		if (userData.data.lastTimeGetReward === dateTime)
			return message.reply(applyFontStyle(getLang("alreadyReceived"), fontStyle));

		const getCoin = reward.coin * (currentDay + 1);
		const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** currentDay);

		userData.data.lastTimeGetReward = dateTime;
		await usersData.set(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			data: userData.data
		});

		// Apply font style to full message
		const fullMessage = applyFontStyle(`>🎀 Baby You have received ${getCoin} coin and ${getExp} exp`, fontStyle);
		message.reply(fullMessage);
	}
};