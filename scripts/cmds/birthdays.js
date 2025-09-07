const fs = require("fs");
const moment = require("moment-timezone");

const birthdayDataPath = "birthdays.json";
const lastSentPath = "lastSentDate.json";
const tid = "7460623087375340"; 

function addUserBirthday(userId, name, date) {
    let data = fs.existsSync(birthdayDataPath) ? JSON.parse(fs.readFileSync(birthdayDataPath, "utf-8")) : {};
    data[userId] = { name, date };
    fs.writeFileSync(birthdayDataPath, JSON.stringify(data, null, 2));

    return `✅ ${name}'s birthday is saved on ${date}!`;
}

function listBirthdays() {
    if (!fs.existsSync(birthdayDataPath)) return "❌ No birthdays saved!";
    let data = JSON.parse(fs.readFileSync(birthdayDataPath, "utf-8"));

    if (Object.keys(data).length === 0) return "❌ No birthdays saved!";

    let sortedData = Object.values(data).sort((a, b) => {
        const [monthA, dayA] = a.date.split("-").map(Number);
        const [monthB, dayB] = b.date.split("-").map(Number);
        return monthA - monthB || dayA - dayB;
    });

    let list = "🎂 Happy Birthday List 🎂\n\nUser name:   MM-DD\n";
    for (let entry of sortedData) {
        let paddedName = entry.name.padEnd(10);
        let paddedDate = entry.date.padStart(5);
        list += `👤 ${paddedName}  ${paddedDate}\n`;
    }
    return list;
}

function hasSentToday() {
    if (!fs.existsSync(lastSentPath)) return false;
    const lastSent = JSON.parse(fs.readFileSync(lastSentPath, "utf-8"));
    return lastSent.date === moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
}

function markAsSent() {
    const today = moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
    fs.writeFileSync(lastSentPath, JSON.stringify({ date: today }));
}

module.exports = {
    config: {
        name: "birthday",
        version: "1.2",
        author: "MahMud",
        category: "utility",
        usage: "[add @user MM-DD] | [add UID MM-DD] | [list]",
        description: "Save birthdays, view the list, and send automatic wishes in a specific thread.",
    },

    onStart: async function ({ message, args, usersData, api }) {
        if (args[0] === "add") {
            let userId, name;
            let date = args[3];

            if (args[1] && args[2] && /^\d{2}-\d{2}$/.test(date)) {
                userId = args[1];
                name = args[2];
            } else if (Object.keys(message.mentions || {}).length > 0) {
                userId = Object.keys(message.mentions)[0];
                name = usersData[userId]?.name || "User";
            } else if (/^\d+$/.test(args[1])) {
                userId = args[1];
                name = usersData[userId]?.name || "User";
            } else {
                return message.reply("❌ Please provide the UID, name, and a valid date in MM-DD format!");
            }

            if (!date || !/^\d{2}-\d{2}$/.test(date)) {
                return message.reply("❌ Please provide the date in MM-DD format!");
            }

            let response = addUserBirthday(userId, name, date);
            message.reply(response);
        } else if (args[0] === "list") {
            let response = listBirthdays();
            message.reply(response);
        } else {
            message.reply("⚡ Usage:\n- **birthday add UID name MM-DD** (Save birthday with UID and name)\n- **birthday list** (View saved birthdays)");
        }
    },

    onChat: async function ({ api, usersData }) {
        try {
            const today = moment().tz("Asia/Dhaka");
            const todayDate = today.format("MM-DD"); // Format: MM-DD

            if (today.hours() !== 0 || today.minutes() !== 0) return;
            if (hasSentToday()) return console.log("✅ Birthday message already sent today. Skipping.");

            if (!fs.existsSync(birthdayDataPath)) return;
            const birthdays = JSON.parse(fs.readFileSync(birthdayDataPath, "utf-8"));

            let sent = false;
            for (const userID in birthdays) {
                const user = birthdays[userID];

                if (user.date === todayDate) {
                    try {
                        const data = await usersData.get(userID);
                        const userName = data?.name || user.name || "User";
                        const birthdayMsg = `𝐇𝐚𝐩𝐩𝐲 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 ${userName}🎂🎀\n\n𝐦𝐚𝐧𝐲 𝐦𝐚𝐧𝐲 𝐡𝐚𝐩𝐩𝐲 𝐫𝐞𝐭𝐮𝐫𝐧𝐬 𝐨𝐟 𝐭𝐡𝐞 𝐝𝐚𝐲..🌸💫\n𝐈 𝐰𝐢𝐬𝐡 𝐞𝐯𝐞𝐫𝐲 𝐦𝐨𝐦𝐞𝐧𝐭 𝐨𝐟 𝐲𝐨𝐮𝐫 𝐥𝐢𝐟𝐞 𝐭𝐨 𝐛𝐞 𝐡𝐚𝐩𝐩𝐲.\n𝐌𝐚𝐲 𝐞𝐯𝐞𝐫𝐲𝐭𝐡𝐢𝐧𝐠 𝐛𝐞 𝐧𝐞𝐰 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐝𝐚𝐲!`;

                        api.sendMessage({ body: birthdayMsg, mentions: [{ tag: userName, id: userID }] }, tid);
                        console.log(`✅ Birthday wish sent to ${userName}`);
                        sent = true;
                    } catch (error) {
                        console.error(`❌ Error sending birthday wish to ${userID}:`, error);
                    }
                }
            }

            if (sent) markAsSent(); // Mark as sent only if at least one message was sent
        } catch (error) {
            console.error("❌ Error:", error);
        }
    }
};
