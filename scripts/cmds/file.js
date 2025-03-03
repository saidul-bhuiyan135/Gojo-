const fs = require('fs');

module.exports = {
	config: {
		name: "file",
		aliases: ["files", "sendfile"],
		version: "1.0",
		author: "404",
		countDown: 5,
		role: 0,
		shortDescription: "Send bot script",
		longDescription: "Send bot specified file ",
		category: "𝗢𝗪𝗡𝗘𝗥",
		guide: "{pn} file name. Ex: .{pn} filename"
	},

	onStart: async function ({ message, args, api, event }) {
		const permission = ["61555887493470"];
		if (!permission.includes(event.senderID)) {
			return api.sendMessage("📛 𝗬𝗼𝘂 𝗵𝗮𝘃𝗲 𝗻𝗼 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻. 𝗧𝗵𝗶𝘀 𝗰𝗺𝗱 𝗰𝗮𝗻 𝗼𝗻𝗹𝘆 𝘂𝘀𝗲 𝗔𝗯𝗶𝗿..", event.threadID, event.messageID);
		}

		const fileName = args[0];
		if (!fileName) {
			return api.sendMessage("Please provide a file name.", event.threadID, event.messageID);
		}

		const filePath = __dirname + `/${fileName}.js`;
		if (!fs.existsSync(filePath)) {
			return api.sendMessage(`File not found: ${fileName}.js`, event.threadID, event.messageID);
		}

		const fileContent = fs.readFileSync(filePath, 'utf8');
		api.sendMessage({ body: fileContent }, event.threadID);
	}
};
