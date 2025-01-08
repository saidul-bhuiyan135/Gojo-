const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");
const dataFile = path.join(__dirname, "anime.json");

module.exports = {
  config: {
    name: "aniquiz",
    aliases: ["animequiz","aniqz"],
    version: "1.0",
    author: "Kshitiz",
    role: 0,
    shortDescription: "Guess the anime character",
    longDescription: "Guess the name of the anime character based on provided traits and tags.",
    category: "game",
    guide: "{p}aniquiz",
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      const characterData = await this.fetchCharacterData();
      if (!characterData || !characterData.data) {
        console.error("Error fetching character data");
        return message.reply("Failed to fetch character data. Please try again later.");
      }

      const { image, traits, tags, fullName, firstName } = characterData.data;
      const imageStream = await this.downloadImage(image);

      if (!imageStream) {
        console.error("Error downloading image");
        return message.reply("Failed to download image. Please try again later.");
      }

      const quizMessage = {
        body: `🎭 Guess the Anime Character!\n\n🔹 **Traits:** ${traits}\n🔹 **Tags:** ${tags}\n\nReply with your answer!`,
        attachment: imageStream,
      };

      api.sendMessage(quizMessage, event.threadID, async (error, info) => {
        if (error) {
          console.error("Error sending message:", error);
          return message.reply("Failed to send quiz. Please try again later.");
        }

        // Set reply context
        global.GoatBot.onReply.set(info.messageID, {
          type: "aniquiz",
          commandName: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          correctAnswers: [fullName.toLowerCase(), firstName.toLowerCase()],
        });

        // Auto-unsend after 15 seconds
        setTimeout(async () => {
          await api.unsendMessage(info.messageID);
        }, 41000);
      });
    } catch (error) {
      console.error("Error in onStart:", error);
      message.reply("An error occurred. Please try again later.");
    }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    try {
      const { correctAnswers, author } = Reply;

      // Ignore replies from unauthorized users
      if (event.senderID !== author) return;

      const userAnswer = event.body.trim().toLowerCase();
      const userData = await usersData.get(author) || { money: 0, exp: 0 };

      if (correctAnswers.includes(userAnswer)) {
        // Reward correct answer
        const rewardCoins = 1000;
        const rewardExp = 200;

        await usersData.set(author, {
          money: userData.money + rewardCoins,
          exp: userData.exp + rewardExp,
        });

        await api.sendMessage(
          `🎉 Correct, ${await usersData.getName(author)}!\nYou earned ${rewardCoins} Coins 💰 and ${rewardExp} EXP 🌟.`,
          event.threadID,
          event.messageID
        );
      } else {
        // Penalty for wrong answer
        const penaltyCoins = 250;
        const penaltyExp = 50;

        await usersData.set(author, {
          money: Math.max(0, userData.money - penaltyCoins),
          exp: Math.max(0, userData.exp - penaltyExp),
        });

        await api.sendMessage(
          `❌ Wrong answer.\nThe correct answer was: ${correctAnswers[0]}\nYou lost ${penaltyCoins} Coins 💰 and ${penaltyExp} EXP 🌟.`,
          event.threadID,
          event.messageID
        );
      }

      // Clean up messages
      await api.unsendMessage(Reply.messageID);
      await api.unsendMessage(event.messageID);
    } catch (error) {
      console.error("Error handling reply:", error);
    }
  },

  fetchCharacterData: async function () {
    try {
      const response = await axios.get("https://animequiz-mu.vercel.app/kshitiz");
      return response;
    } catch (error) {
      console.error("Error fetching character data:", error);
      return null;
    }
  },

  downloadImage: async function (imageUrl) {
    try {
      const filename = "anime_character.jpg";
      const filePath = path.join(cacheDir, filename);

      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      if (!response.data || response.data.length === 0) {
        console.error("Empty image data received from the API.");
        return null;
      }

      await fs.ensureDir(cacheDir);
      await fs.writeFile(filePath, response.data, "binary");

      return fs.createReadStream(filePath);
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  },
};
