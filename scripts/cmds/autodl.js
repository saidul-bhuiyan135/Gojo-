const axios = require("axios");
const fs = require("fs-extra");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "autodl",
    aliases: ["megadownloader"],
    version: "1.2",
    author: "saidul--",
    countDown: 5,
    role: 0,
    longDescription: "Download content automatically from supported links, including YouTube videos.",
    category: "media",
    guide: "{pn} [link]: Download from supported links. Use '{pn} chat on/off' to enable/disable auto-download."
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    const link = args.join(" ");

    // Handle auto-download toggle (on/off)
    if (args[0] === "chat" && (args[1] === "on" || args[1] === "off") || args[0] === "on" || args[0] === "off") {
      if (role >= 1) {
        const choice = args[0] === "on" || args[1] === "on";
        await threadsData.set(event.threadID, { data: { autoDownload: choice } });
        return message.reply(`Auto-download has been turned ${choice ? "on" : "off"} for this group.`);
      } else {
        return message.reply("You don't have permission to toggle auto-download.");
      }
    }

    // If no link is provided, ask for one
    if (!link) {
      return message.reply("Please provide a link to start downloading.");
    } else {
      message.reaction("⏳", event.messageID);
      await downloadContent({ link, message, event });
    }
  },

  onChat: async function({ event, message, threadsData }) {
    const threadData = await threadsData.get(event.threadID);

    // If auto-download is off or the message is from the bot, ignore
    if (!threadData?.data?.autoDownload || event.senderID === global.botID) return;

    try {
      const urlRegex = /https:\/\/[^\s]+/;
      const match = event.body.match(urlRegex);

      if (match) {
        const link = match[0];
        const prefix = await global.utils.getPrefix(event.threadID);

        // Prevent action if the message starts with the bot's prefix
        if (!event.body.startsWith(prefix)) {
          message.reaction("⏳", event.messageID);
          await downloadContent({ link, message, event });
        }
      }
    } catch (error) {
      message.reaction("", event.messageID);
      console.error("onChat error:", error);
    }
  }
};

async function downloadContent({ link, message, event }) {
  try {
    // Check if it's a YouTube link
    const urlRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w|-]{11})(?:\S+)?$/;
    if (urlRegex.test(link)) {
      message.reaction("⏳", event.messageID);
      await downloadYouTubeVideo({ link, message, event });
    } else {
      // Handle other types of links here (e.g., megadl, etc.)
      const apiURL = "https://app.only-fans.club/megatron/cosmic";
      const { data } = await axios.post(apiURL, { url: link });

      if (!data || !data.url) {
        throw new Error("Invalid or unsupported link.");
      }

      const responseStream = await axios({
        method: "get",
        url: data.url,
        responseType: "stream"
      });

      await message.reply({
        body: `• ${data.title || "Content"}\n• Source: ${link}`,
        attachment: responseStream.data
      });

      message.reaction("✅", event.messageID);
    }
  } catch (error) {
    message.reaction("❌", event.messageID); // Reaction on error
    console.error("Download error:", error);
  }
}

async function downloadYouTubeVideo({ link, message, event }) {
  try {
    const d = (await axios.get('https://raw.githubusercontent.com/Tanvir0999/stuffs/refs/heads/main/raw/addresses.json')).data.yt;

    // Test if the download API is responding
    const { data } = await axios.post(d, {
      url: link,
      filesize: 34,
      format: "video",
      cookies: fs.readFileSync("cookie.txt", "utf-8") // Ensure the cookie.txt file exists and is correctly formatted
    });

    if (!data || !data.url) {
      throw new Error("Unable to retrieve YouTube video data.");
    }

    // Reply with the video details and attach the stream
    await message.reply({
      body: `• ${data.title}\n• Duration: ${data.duration}\n• Upload Date: ${data.upload_date}`,
      attachment: await getStreamFromURL(data.url)
    });

    message.reaction("✅", event.messageID); // Success reaction
  } catch (err) {
    message.reaction("❌", event.messageID); // Failure reaction
    console.error("YouTube download error:", err);
  }
    }
