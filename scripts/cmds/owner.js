const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "owner",
		author: "Tokodori",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "admin",
		guide: "{pn}"
	},

	onStart: async function ({ api, event }) {
		try {
			const ownerInfo = {
				name: '𝐌𝐨𝐡𝐚𝐦𝐦𝐞𝐝 𝐀𝐛𝐢𝐫',
				gender: '𝗠𝗮𝗹𝗲',
				hobby: '𝗖𝗼𝗱𝗲 𝗘𝘃𝗲𝗿𝘆𝗱𝗮𝘆',
				Fb: 'https://www.facebook.com/profile.php?id=100078140834638',
				Relationship: 'Mingle',
				/**bio: '💕 Love is the heartbeat of my soul.🌹 Roses are red, violets are blue, my love for life begins with you.🌟 Love lights up my world.👑 King of my own world, where love is the law'**/
			};

			const bold = '';
			const tmpFolderPath = path.join(__dirname, 'tmp');

			if (!fs.existsSync(tmpFolderPath)) {
				fs.mkdirSync(tmpFolderPath);
			}

			const videoResponse = await axios.get(bold, { responseType: 'arraybuffer' });
			const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

			fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

			const response = `
◈ 𝖮𝖶𝖭𝖤𝖱 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖳𝖨𝖮𝖭:\n
Name: ${ownerInfo.name}
Gender: ${ownerInfo.gender}
Relationship: ${ownerInfo.Relationship}
Hobby: ${ownerInfo.hobby}
Fb: ${ownerInfo.Fb}
			`;

			await api.sendMessage({
				body: response,
				attachment: fs.createReadStream(videoPath)
			}, event.threadID, event.messageID);

			fs.unlinkSync(videoPath);

			api.setMessageReaction('🚀', event.messageID, (err) => {}, true);
		} catch (error) {
			console.error('Error in ownerinfo command:', error);
			return api.sendMessage('An error occurred while processing the command.', event.threadID);
		}
	}
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });