module.exports = {
	config: {
		name: "uptime",
		aliases: ["up", "upt"],
		version: "1.0",
		author: "saidul",
		role: 0,
		shortDescription: {
			en: "Displays the uptime of the bot."
		},
		longDescription: {
			en: "Displays the amount of time that the bot has been running for."
		},
		category: "System",
		guide: {
			en: "Use {p}uptime to display the uptime of the bot."
		}
	},
	onStart: async function ({ api, event, args }) {
		const uptime = process.uptime();
		const seconds = Math.floor(uptime % 60);
		const minutes = Math.floor((uptime / 60) % 60);
		const hours = Math.floor((uptime / (60 * 60)) % 24);
		const days = Math.floor(uptime / (60 * 60 * 24));
		const uptimeString = `${hours} 🕰️ 𝗛𝗢𝗨𝗥'𝗦 ${minutes} ⏰ 𝗠𝗜𝗡𝗨𝗧𝗘'𝗦 ${seconds}⏳ 𝗦𝗘𝗖𝗢𝗡𝗗`;
		api.sendMessage(`hello user, the bot has been running for ${uptimeString}.`, event.threadID);
	}
};
