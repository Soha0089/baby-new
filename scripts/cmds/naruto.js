module.exports = {
	config: {
		name: "naruto",
		aliases: ["naruto"],
		version: "1.0",
		author: "𝗠𝗮𝗵 𝗠𝗨𝗗 彡",
		countDown: 5,
		role: 0,
		shortDescription: "send you pic&video of gojo",
		longDescription: "",
		category: "anime",
		guide: "{pn}"
	},

	onStart: async function ({ message }) {
	 var link = [

"https://telegra.ph/file/856a47d9e4bbc750ba00a.jpg",
"https://telegra.ph/file/6b2102cb85d94adcf1a1c.jpg",
"https://telegra.ph/file/aa18eeb09916dbed0f3b0.jpg",
"https://telegra.ph/file/b0783a836bc71c69c438d.jpg",
"https://telegra.ph/file/7e5bc048867ee5480f313.jpg",
"https://telegra.ph/file/2e1403fe95fe567d9ee45.jpg",
"https://telegra.ph/file/f1806484ce008003f3862.jpg",
"https://telegra.ph/file/29ccf008234cbfd626ccd.jpg",
"https://telegra.ph/file/5fc699d54d3f7a86cc9a7.jpg",
"https://telegra.ph/file/569fb02ef7f9922931999.jpg",
"https://telegra.ph/file/648725084d8cbaaf39a35.jpg",
"https://telegra.ph/file/8e0a29e068b6e590787c0.jpg",
"https://telegra.ph/file/5f48068d40e741aedde85.jpg",
"https://telegra.ph/file/1dfbf55cf0b0e63d9100c.jpg",
"https://telegra.ph/file/c3f8dc49c7dab5cead7f0.jpg",
"https://telegra.ph/file/91aa2e17cd03b3c5d6282.jpg",
"https://telegra.ph/file/1eff4fcef6447d2b6daba.jpg",
"https://telegra.ph/file/c6d764ed7dcf6751dc5eb.jpg",
"https://telegra.ph/file/afa2235ea5cce28ac0328.jpg",
"https://telegra.ph/file/66fe9f73d613935daba09.jpg",
"https://telegra.ph/file/b77ef78ac83c345c72a8a.jpg",
"https://telegra.ph/file/47593bf6ca5035378f55b.jpg",
"https://telegra.ph/file/9f1d270db69be5a2e9aff.jpg",
"https://telegra.ph/file/84b93e5a59ac50ebb478e.jpg",
"https://telegra.ph/file/0ba9488dcfdfaedacecb9.jpg",
"https://telegra.ph/file/7aa1051ed99f9c1e44e39.jpg",
"https://telegra.ph/file/b129899850c02098921f6.jpg",
"https://telegra.ph/file/5d23ac9f9297c70dbf838.jpg",
"https://telegra.ph/file/edbe66055ef1269dddfa5.jpg",		     
"https://telegra.ph/file/1b59209752e8d9f0020bb.jpg",
"https://telegra.ph/file/e0b6eaed0a4551ac0a5cc.jpg",





		     
               
]

let img = link[Math.floor(Math.random()*link.length)]
message.send({
  body: '𝗡𝗮𝗿𝘂𝘁𝗼🐤',attachment: await global.utils.getStreamFromURL(img)
})
}
}
