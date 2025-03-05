const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
config: {
  name: "info",
  aurthor:"MR.AYAN",// Convert By Goatbot MR.AYAN 
   role: 0,
  shortDescription: " ",
  longDescription: "",
  category: "admin",
  guide: "{pn}"
},

  onStart: async function ({ api, event }) {
  try {
    const ownerInfo = {
      𝙽𝙰𝙼𝙴 :'saidul',
      𝙶𝙴𝙽𝙳𝙴𝚁 :'𝙼𝙰𝙻𝙴',
      𝙰𝙶𝙴 :'𝚄𝙽𝙺𝙽𝙾𝚆𝙽',
      𝙷𝙴𝙸𝙶𝙷𝚃 :'𝚄𝙽𝙺𝙽𝙾𝚆𝙽',
      𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺𝙻𝙸𝙽𝙺 :'⁦https://www.facebook.com/saidulexc123⁩',
      𝙽𝙸𝙲𝙺 :'𝚂𝙰𝙸𝙳𝚄𝙻'
    };

    const bold = 'https://i.imgur.com/3WtgLve.mp4'; // Replace with your Google Drive videoid link ⁦https://drive.google.com/uc?export=download&id=here⁩ put your video id

    const tmpFolderPath = path.join(__dirname, 'tmp');

    if (!fs.existsSync(tmpFolderPath)) {
      fs.mkdirSync(tmpFolderPath);
    }

    const videoResponse = await axios.get(bold, { responseType: 'arraybuffer' });
    const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

    fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

    const response = `
𝙾𝚆𝙽𝙴𝚁 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽:🧾
𝙽𝙰𝙼𝙴 : ${ownerInfo.name}
𝙶𝙴𝙽𝙳𝙴𝚁 : ${ownerInfo.gender}
𝙰𝙶𝙴 : ${ownerInfo.age}
𝙷𝙴𝙸𝙶𝙷𝚃 : ${ownerInfo.height}
𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 : ${ownerInfo.facebookLink}
Nick: ${ownerInfo.nick}
`;


    await api.sendMessage({
      body: response,
      attachment: fs.createReadStream(videoPath)
    }, event.threadID, event.messageID);

    if (event.body.toLowerCase().includes('ownerinfo')) {
      api.setMessageReaction('✅', event.messageID, (err) => {}, true);
    }
  } catch (error) {
    console.error('Error in ownerinfo command:', error);
    return api.sendMessage('An error occurred while processing the command.', event.threadID);
  }
},
};
