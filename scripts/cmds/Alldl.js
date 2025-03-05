const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getStreamFromURL } = global.utils;

function loadAutodlStates() {
  try { return JSON.parse(fs.readFileSync("alldl.json", "utf8")); }
  catch { return {}; }
}

function saveAutodlStates(states) {
  fs.writeFileSync("alldl.json", JSON.stringify(states, null, 2));
}

let autodlStates = loadAutodlStates();

module.exports = {
  threadStates: {},
  config: {
    name: 'alldl',
    version: '2.0',
    author: 'Nyx',
    role: 0,
    category: 'downloader',
    guide: { en: '{p}{n}' }
  },
  
  onStart: async function({ api, event }) {
    const threadID = event.threadID;
    autodlStates[threadID] = autodlStates[threadID] || 'on';
    saveAutodlStates(autodlStates);
    
    const command = event.body.toLowerCase();
    if (command.includes('alldl end')) {
      autodlStates[threadID] = 'off';
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } else if (command.includes('alldl start')) {
      autodlStates[threadID] = 'on';
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
    saveAutodlStates(autodlStates);
  },
  
  onChat: async function({ api, event }) {
    const threadID = event.threadID;
    if (autodlStates[threadID] === 'on' && this.checkLink(event.body)) {
      api.setMessageReaction("⌛", event.messageID, () => {}, true);
      this.downLoad(this.checkLink(event.body).url, api, event);
    }
  },
  
  downLoad: function(url, api, event) {
    const platformHandlers = {
      'instagram.com': this.all,
      'facebook.com': this.all,
      'fb.watch': this.all,
      'tiktok.com': this.all,
      'x.com': this.downloadTwitter,
      'pin.it': this.all,
      'youtube.com': this.downloadYouTube,
      'youtu.be': this.downloadYouTube
    };
    const platform = Object.keys(platformHandlers).find(key => url.includes(key)) || 'default';
    platformHandlers[platform].call(this, url, api, event);
  },
  
  all: async function(url, api, event) {
    try {
      const response = await axios.get(`https://mostakim.onrender.com/m/alldl?url=${url}`);
      await this.streamAndSend(response.data.videos[0].url, api, event);
    } catch (err) {
      this.handleError(api, event, err);
    }
  },
  
  downloadYouTube: async function(url, api, event) {
    try {
      const response = await axios.get(`https://mostakim.onrender.com/m/ytDl?url=${url}`);
      const videoUrl = response.data.url;
      const tempFilePath = path.join(__dirname, `/cache/yt_${Date.now()}.mp4`);
      
      const videoResponse = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempFilePath);
      videoResponse.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      api.sendMessage({
        body: "Here's Your Download Video 🎥",
        attachment: fs.createReadStream(tempFilePath)
      }, event.threadID, event.messageID);
      
      fs.unlink(tempFilePath, (err) => { if (err) console.error(err) });
    } catch (err) {
      this.handleError(api, event, err);
    }
  },
  
  streamAndSend: async function(url, api, event) {
    try {
      api.sendMessage({
        body: "Here's Your Download Video 🎥",
        attachment: await getStreamFromURL(url)
      }, event.threadID, event.messageID);
    } catch (err) {
      this.handleError(api, event, err);
    }
  },
  
  handleError: function(api, event, err) {
    console.error(err);
    api.setMessageReaction("❎", event.messageID, () => {}, true);
    api.sendMessage(`Error: ${err.message}`, event.threadID);
  },
  
  checkLink: function(text) {
    const patterns = {
      instagram: /https:\/\/www\.instagram\.com\/\S+/,
      facebook: /(https?:\/\/.*facebook\.com\/.*|https?:\/\/fb\.watch\/\S+)/,
      tiktok: /https?:\/\/(www\.|vt\.)?tiktok\.com\/\S+/,
      pinterest: /https?:\/\/pin\.it\/\S+/,
      youtube: /(https?:\/\/.*youtube\.com\/.*|https?:\/\/youtu\.be\/\S+)/
    };
    for (const [platform, regex] of Object.entries(patterns)) {
      if (regex.test(text)) return { url: text.match(regex)[0], platform };
    }
    return null;
  }
};