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
 body: " 「  —͞𝙷𝙴𝚈 𝙱𝚁𝙾𝚃𝙷𝙴𝚁'𝚂  \n\n𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁\n𝙰𝚁𝙸𝚈𝙰𝙽 𝚂𝙰𝙸𝙳𝚄𝙻 あ」",
 attachment: await global.utils.getStreamFromURL("https://i.imgur.com/j4UsFKW.mp4")
 });
 }
 }
}
