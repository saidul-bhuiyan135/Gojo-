module.exports = {
 config: {
	 name: "prefix",
	 version: "1.0",
	 author: "Tokodori_Frtiz",//remodified by cliff
	 countDown: 5,
	 role: 0,
	 shortDescription: "no prefix",
	 longDescription: "no prefix",
	 category: "auto 🪐",
 },

 onStart: async function(){}, 
 onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "prefix") {
 return message.reply({
 body: `
𝗠𝗬 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗦  [  /  ]\n
𝗦𝗢𝗠𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗧𝗛𝗔𝗧 𝗠𝗔𝗬 𝗛𝗘𝗟𝗣 𝗬𝗢𝗨:
➥ /help [number of page] -> see commands
➥ /sim [message] -> talk to bot
➥ /callad [message] -> report any problem encountered
➥ /help [command] -> information and usage of command\n\n𝗛𝗔𝗩𝗘 𝗙𝗨𝗡 𝗨𝗦𝗜𝗡𝗚 𝗜𝗧 𝗘𝗡𝗝𝗢𝗬!🪐\n𝗕𝗢𝗧 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥:𝗦𝗔𝗜𝗗𝗨𝗟`,
 attachment: await global.utils.getStreamFromURL("https://i.imgur.com/M4luPbE.gif")
 });
 }
 }
}
