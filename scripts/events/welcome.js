const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "1.7",
        author: "ntkhang",
        category: "events"
    },

    langs: {
        en: {
            session1: "𝗲𝗮𝗿𝗹𝘆 𝗺𝗼𝗿𝗻𝗶𝗻𝗴",  // 4 AM - 6 AM
            session2: "𝗺𝗼𝗿𝗻𝗶𝗻𝗴",         // 6 AM - 12 PM
            session3: "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻",        // 12 PM - 4 PM
            session4: "𝗲𝘃𝗲𝗻𝗶𝗻𝗴",          // 4 PM - 8 PM
            session5: "𝗻𝗶𝗴𝗵𝘁",           // 8 PM - 12 AM
            session6: "𝗺𝗶𝗱𝗻𝗶𝗴𝗵𝘁",         // 12 AM - 2 AM
            session7: "𝗹𝗮𝘁𝗲 𝗻𝗶𝗴𝗵𝘁",       // 2 AM - 4 AM
            welcomeMessage: "⚪⚫🟡🟢🔴🔵\n\n🤖 Thank you for inviting me! 🌟\n\n🚀 Let's get started! Here's some useful information:\n\n- Bot Prefix: %1\n\n- To discover the list of available commands, type: %1help\n\n📚 Need assistance or have questions? Feel free to reach out anytime. Enjoy your time in the group! 🌈✨",
            multiple1: "𝘆𝗼𝘆",
            multiple2: "𝘆𝗼𝘂 𝗴𝘂𝘆𝘀",
            defaultWelcomeMessage: `🥰 𝗔𝗦𝗦𝗔𝗟𝗔𝗠𝗨𝗟𝗔𝗜𝗞𝗨𝗠 🥰

>🎀 {userName}

𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘆𝗼𝘂 𝘁𝗼 𝗼𝘂𝗿
[ {boxName} ]
𝗚𝗿𝗼𝗨𝗽
𝗛𝗮𝘃𝗲 𝗮 𝗻𝗶𝗰𝗲 {session} 😊
⚠ 𝗜 𝗵𝗼𝗽𝗲 𝘆𝗼𝘂 𝘄𝗶𝗹𝗹 𝗳𝗼𝗹𝗹𝗼𝘄 𝗼𝘂𝗿 𝗮𝗹𝗹 𝗴𝗿𝗼𝗨𝗽 𝗿𝘂𝗹𝗲𝘀♻

• 𝗢𝘄𝗻𝗲𝗿: 𝗠𝗮𝗵𝗠𝗨𝗗
• 𝗳𝗯: m.me/mahmud.x07`
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe")
            return async function () {
                const hours = getTime("HH");
                const { threadID } = event;
                const { nickNameBot } = global.GoatBot.config;
                const prefix = global.utils.getPrefix(threadID);
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // Bot joined
                if (dataAddedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
                    if (nickNameBot)
                        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                    return message.send(getLang("welcomeMessage", prefix));
                }

                if (!global.temp.welcomeEvent[threadID])
                    global.temp.welcomeEvent[threadID] = {
                        joinTimeout: null,
                        dataAddedParticipants: []
                    };

                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
                    const threadData = await threadsData.get(threadID);
                    if (threadData.settings.sendWelcomeMessage === false) return;

                    const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                    const threadName = threadData.threadName;
                    const mentions = [];

                    for (const user of dataAddedParticipants) {
                        mentions.push({ tag: user.fullName, id: user.userFbId });
                    }

                    if (mentions.length === 0) return;

                    let welcomeMessage = threadData.data?.welcomeMessage || getLang("defaultWelcomeMessage");

                    welcomeMessage = welcomeMessage
                        .replace(/\{userName\}|\{userNameTag\}/g, mentions.map(m => m.tag).join(", "))
                        .replace(/\{boxName\}|\{threadName\}/g, threadName)
                        .replace(/\{multiple\}/g, dataAddedParticipants.length > 1 ? getLang("multiple2") : getLang("multiple1"))
                        .replace(/\{session\}/g,
                            hours < 4 ? getLang("session7") :
                            hours < 6 ? getLang("session1") :
                            hours < 12 ? getLang("session2") :
                            hours < 16 ? getLang("session3") :
                            hours < 20 ? getLang("session4") :
                            hours < 24 ? getLang("session5") :
                            getLang("session6")
                        );

                    const form = {
                        body: welcomeMessage,
                        mentions
                    };

                    // Optional: Load welcome attachments (images/videos) if set
                    if (threadData.data?.welcomeAttachment) {
                        const files = threadData.data.welcomeAttachment;
                        const attachments = files.reduce((acc, file) => {
                            acc.push(drive.getFile(file, "stream"));
                            return acc;
                        }, []);
                        form.attachment = (await Promise.allSettled(attachments))
                            .filter(({ status }) => status == "fulfilled")
                            .map(({ value }) => value);
                    }

                    message.send(form);
                    delete global.temp.welcomeEvent[threadID];
                }, 1500);
            };
    }
};
