const axios = require('axios');

module.exports = {
  config: {
    name: "dalle",
    aliases: ["bing", "create", "imagine"],
    version: "1.0",
    author: "Dipto",
    countDown: 10,
    role: 0,
    description: "Generate images by Unofficial Dalle3",
    category: "Image gen",
    premium: false,
    guide: { en: "{pn} prompt" }
  }, 
  onStart: async({ api, event, args }) => {
    const prompt = (event.messageReply?.body.split("dalle")[1] || args.join(" ")).trim();
    if (!prompt) return api.sendMessage("❌| Wrong Format. ✅ | Use: 17/18 years old boy/girl watching football match on TV with 'Naruto' and '7' written on the back of their dress, 4k", event.threadID, event.messageID);
    try {
  const cookies = ["1ljd-ZtgHLuZleIJSSLtYrI2-Z2Ooua0sS7L796XI4i5obiN7FPxtnB8t1YNA_wOVPu-SwTxQ1l6lrKck4sRnxBPvKifdN8Mv40Q_WmTs1vuAEhEJ8vBVkab7S1JKkOTmJ1jqI_TZIVR-G13rNkElTDvi7NZLGXxhdzZT1xSu4HjyeLHpNH9gKdKP63nqVWySms1PqSF8M9jCDzc4BxS85g"];
const randomCookie = cookies[Math.floor(Math.random() * cookies.length)];
      const wait = api.sendMessage("Wait koro baby 😽", event.threadID);
      const response = await axios.get(`https://www.noobs-api.rf.gd/dipto/dalle?prompt=${prompt}&key=dipto008`);
const imageUrls = response.data.imgUrls || [];
      if (!imageUrls.length) return api.sendMessage("Empty response or no images generated.", event.threadID, event.messageID);
      const images = await Promise.all(imageUrls.map(url => axios.get(url, { responseType: 'stream' }).then(res => res.data)));
    api.unsendMessage(wait.messageID);
   api.sendMessage({ body: `✅ | Here's Your Generated Photo 😘`, attachment: images }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`Generation failed!\nError: ${error.message}`, event.threadID, event.messageID);
    }
  }
}
