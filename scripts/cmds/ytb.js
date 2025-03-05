const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const ytDlpDir = path.join(__dirname, "yt-dlp-bin");
const ytDlpPath = path.join(ytDlpDir, "yt-dlp");

// Ensure yt-dlp is installed
async function ensureYtDlp() {
    if (!fs.existsSync(ytDlpPath)) {
        console.log("Installing yt-dlp...");
        await new Promise((resolve, reject) => {
            exec(`mkdir -p ${ytDlpDir} && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ${ytDlpPath} && chmod +x ${ytDlpPath}`, (error, stdout, stderr) => {
                if (error) return reject(new Error(`Failed to install yt-dlp: ${stderr || error.message}`));
                resolve();
            });
        });
    }
}

const cookiesPath = path.join(__dirname, "cookies.txt");

const YOUTUBE_API_KEY = 'AIzaSyDYFu-jPat_hxdssXEK4y2QmCOkefEGnso'; // Your YouTube API key

async function searchYoutube(query) {
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=6`);
        return response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high.url
        }));
    } catch (error) {
        throw new Error(`Failed to search YouTube: ${error.message}`);
    }
}

async function downloadAndSendMedia(videoUrl, type, message) {
    try {
        await ensureYtDlp();
        const outputFile = path.join(__dirname, type === "audio" ? "audio.mp3" : "video.mp4");
        const format = type === "audio" ? "bestaudio[ext=m4a]" : "best[ext=mp4]";

        await new Promise((resolve, reject) => {
            exec(`${ytDlpPath} --cookies "${cookiesPath}" -f ${format} -o "${outputFile}" ${videoUrl}`, (error, stdout, stderr) => {
                if (error) return reject(new Error(`yt-dlp error: ${stderr || error.message}`));
                resolve();
            });
        });

        await message.reply({
            body: `Here is your ${type}:`,
            attachment: fs.createReadStream(outputFile)
        });

        fs.unlinkSync(outputFile);
    } catch (error) {
        throw new Error(`Failed to download ${type}: ${error.message}`);
    }
}

async function getVideoInfo(videoUrl, message) {
    try {
        await ensureYtDlp();
        const { stdout } = await new Promise((resolve, reject) => {
            exec(`${ytDlpPath} --cookies "${cookiesPath}" -j ${videoUrl}`, (error, stdout, stderr) => {
                if (error) return reject(new Error(`yt-dlp error: ${stderr || error.message}`));
                resolve({ stdout });
            });
        });

        const videoData = JSON.parse(stdout);
        const infoMessage = `💠 Title: ${videoData.title}\n🏪 Channel: ${videoData.uploader}\n⏱ Duration: ${videoData.duration} seconds\n🔠 ID: ${videoData.id}\n🔗 Link: ${videoUrl}`;
        await message.reply(infoMessage);
    } catch (error) {
        throw new Error(`Failed to retrieve video info: ${error.message}`);
    }
}

module.exports = {
    config: {
        name: "ytb",
        version: "3.30",
        author: "saidul",
        countDown: 5,
        role: 0,
        description: { en: "Download video, audio or view video information on YouTube" },
        category: "media",
        guide: { en: "   {pn} [video|-v] [<video name>|<video link>]: download video\n   {pn} [audio|-a] [<video name>|<video link>]: download audio\n   {pn} [info|-i] [<video name>|<video link>]: view info" }
    },

    langs: {
        en: {
            error: "❌ An error occurred: %1",
            noResult: "⭕ No search results match the keyword %1",
            choose: "%1\n\nReply with a number to choose or any other text to cancel",
            searching: "🔎 Searching for your request...",
            downloading: "⬇️ Downloading your %1, please wait...",
            info: "💠 Title: %1\n🏪 Channel: %2\n⏱ Duration: %3\n🔠 ID: %4\n🔗 Link: %5"
        }
    },

    onStart: async function ({ args, message, event, commandName, getLang }) {
        let type;
        switch (args[0]) {
            case "-v":
            case "video":
                type = "video";
                break;
            case "-a":
            case "audio":
                type = "audio";
                break;
            case "-i":
            case "info":
                type = "info";
                break;
            default:
                return message.SyntaxError();
        }

        const input = args.slice(1).join(" ");
        if (!input) return message.SyntaxError();

        try {
            const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
            if (youtubeUrlPattern.test(input)) {
                await processYoutubeUrl(input, type, message, getLang);
            } else {
                await message.reply(getLang("searching"));
                const searchResults = await searchYoutube(input);
                if (searchResults.length === 0) {
                    return message.reply(getLang("noResult", input));
                }

                let msg = "";
                for (let i = 0; i < searchResults.length; i++) {
                    msg += `${i + 1}. ${searchResults[i].title} - ${searchResults[i].channel}\n\n`;
                }

                const response = await message.reply(getLang("choose", msg));

                global.GoatBot.onReply.set(response.messageID, {
                    commandName,
                    messageID: response.messageID,
                    author: event.senderID,
                    type,
                    searchResults
                });
            }
        } catch (error) {
            console.error(error);
            return message.reply(getLang("error", error.message));
        }
    },

    onReply: async function ({ message, event, getLang, Reply }) {
        const { type, searchResults, messageID } = Reply;
        const choice = parseInt(event.body);

        if (isNaN(choice) || choice < 1 || choice > searchResults.length) {
            return message.reply(getLang("error", "Invalid choice"));
        }

        await message.unsend(messageID);
        await message.reply(getLang("downloading", type));

        const selectedVideo = searchResults[choice - 1];
        const videoUrl = `https://youtu.be/${selectedVideo.id}`;

        try {
            await processYoutubeUrl(videoUrl, type, message, getLang);
        } catch (error) {
            console.error(error);
            return message.reply(getLang("error", error.message));
        }
    }
};

async function processYoutubeUrl(url, type, message, getLang) {
    try {
        if (type === "video") {
            await downloadAndSendMedia(url, "video", message);
        } else if (type === "audio") {
            await downloadAndSendMedia(url, "audio", message);
        } else if (type === "info") {
            await getVideoInfo(url, message);
        }
    } catch (error) {
        throw new Error(`Failed to process YouTube URL: ${error.message}`);
    }
}
