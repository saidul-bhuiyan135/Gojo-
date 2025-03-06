module.exports = {
 config: {
	 name: "saidul",
	 version: "1.0",
	 author: "AceGun",
	 countDown: 5,
	 role: 0,
	 shortDescription: "no prefix",
	 longDescription: "no prefix",
	 category: "no prefix",
 },

 onStart: async function(){}, 
 onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "saidul") {
 return message.reply({
 body: "  𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝗮𝗱𝗱𝗶𝗻𝗴 𝗺𝘆 𝗹𝗼𝗿𝗱 𝗦𝗮𝗶𝗱𝘂𝗹 🦄☄️ ",
 attachment: await global.utils.getStreamFromURL("https://i.imgur.com/o8dYzFU.mp4")
 });
 }
 }
}
