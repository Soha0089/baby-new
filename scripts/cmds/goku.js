module.exports = {
	config: {
		name: "goku",
		aliases: ["goku"],
		version: "1.0",
		author: "𝗠𝗮𝗵 𝗠𝗨𝗗 彡",
		countDown: 5,
		role: 0,
		shortDescription: "send you pic&video of goku",
		longDescription: "",
		category: "anime",
		guide: "{pn}"
	},

	onStart: async function ({ message }) {
	 var link = [ 

"https://telegra.ph/file/3ee15a0109a35cab7519e.jpg",
"https://telegra.ph/file/9ee28528f6918b72f61e9.jpg",
"https://telegra.ph/file/12bd96b2398852c58fc44.jpg",
"https://telegra.ph/file/446dbceb0049527eff352.jpg",
"https://telegra.ph/file/0d9ef07aa9e2b745c7d0c.jpg",
"https://telegra.ph/file/0bfb894943e8ba2aa45e9.jpg",
"https://telegra.ph/file/c83267aa3efb08673b71e.jpg",
"https://telegra.ph/file/0e6cdf18cdcfc79c78fec.jpg",
"https://telegra.ph/file/f7e749027377c32d4fd41.jpg",
"https://telegra.ph/file/09a788aaeab1f71da11d5.jpg",
"https://telegra.ph/file/35da657eeb3a1d657acac.jpg",
"https://telegra.ph/file/8fc0441417afe1311d8e2.jpg",
"https://telegra.ph/file/0554ccabeed0a75431e5e.jpg",
"https://telegra.ph/file/72c22a75fc9c60711d7a7.jpg",
"https://telegra.ph/file/b9a021cf99a6221e9224c.jpg",
"https://telegra.ph/file/32af81dd03f2897114a2e.jpg",
"https://telegra.ph/file/daa8c356d0fc6c51c1861.jpg",
"https://telegra.ph/file/3c5c9ff2c0b45469f92de.jpg",
"https://telegra.ph/file/adbdaa1fb908591ac274c.jpg",
"https://telegra.ph/file/efb0a1a88fb9885c6f97c.jpg",
"https://telegra.ph/file/feefe3842423ff4f113ff.jpg",
"https://telegra.ph/file/c008d473c31bebbd25666.jpg",
"https://telegra.ph/file/0289ca2a26cee800b5120.jpg",
"https://telegra.ph/file/a1ef403a5c3bceaedfba6.jpg", 
"https://telegra.ph/file/7d9bc0c19426751fee46e.jpg",
"https://telegra.ph/file/20952dc556e06e97eb2a3.jpg",
"https://telegra.ph/file/dbc93052f1d8256c854ba.jpg",
"https://telegra.ph/file/0843571f157a66991b4bb.jpg",
"https://telegra.ph/file/086af40f4d0672e77eec3.jpg",
"https://telegra.ph/file/f1ef62be102df09a83890.jpg",
"https://telegra.ph/file/cb2f09171d14c34f2a57f.jpg",
"https://telegra.ph/file/a49c7aecea87a6f83f7cd.jpg",
"https://telegra.ph/file/2232fd591b4c815677ae1.jpg",
"https://telegra.ph/file/bb5a2cf08232235dd6e3a.jpg",
"https://telegra.ph/file/24717eeb3295f55ae57e2.jpg",
"https://telegra.ph/file/03f81fe94fd31dd0fdf5a.jpg",
"https://telegra.ph/file/dc678ae37332c851ab2e6.jpg",
"https://telegra.ph/file/cda991d5d7d6083186f7f.jpg",
"https://telegra.ph/file/adf100242631ccd512578.jpg",
"https://telegra.ph/file/c24ba02cba13529651c38.jpg",
"https://telegra.ph/file/5918a0550dcd1e79981f3.jpg",
"https://telegra.ph/file/5f9bde4057822b26c8291.jpg",
"https://telegra.ph/file/fdf6ac7f3f554db6ab673.jpg",
"https://telegra.ph/file/e1688cc17d542943b60ee.jpg",
"https://telegra.ph/file/1f91fa820fc42293ea209.jpg",


		     
               
]

let img = link[Math.floor(Math.random()*link.length)]
message.send({
  body: '𝗡𝗮𝘄 𝗕𝗮𝗯𝘆 𝗚𝗼𝗸𝘂 𝗶𝗺𝗮𝗴𝗲 <😘',attachment: await global.utils.getStreamFromURL(img)
})
}
  }
