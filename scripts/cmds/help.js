const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "1.17",
    author: "saidul 🚀",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📖 View command usage" },
    longDescription: { en: "📜 View command usage and list all commands directly" },
    category: "info",
    guide: { en: "🔹 {pn} / help cmdName" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = `\n🌟 𝗔𝗥𝗜𝗬𝗔𝗡 𝗦𝗔𝗜𝗗𝗨𝗟 🌟\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${category.toUpperCase()}`;
          const names = categories[category].commands.sort();
          names.forEach((item) => msg += `\n🔹 ${item}`);
        }
      });

      msg += `\n____\n📌 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${commands.size}`;
      msg += `\n💡 𝗧𝘆𝗽𝗲 "${prefix}𝗵𝗲𝗹𝗽 𝗰𝗺𝗱𝗡𝗮𝗺𝗲" 𝘁𝗼 𝘀𝗲𝗲 𝗱𝗲𝘁𝗮𝗶𝗹𝘀!`;
      msg += `\n____`;
      await message.reply(msg);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`❌ Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";
        const longDescription = configCommand.longDescription?.en || "No description";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `🔹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: ${configCommand.name}\n____\n📌 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${longDescription}\n____\n🆔 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}\n____\n📎 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${configCommand.version || "1.0"}\n____\n👤 𝗥𝗼𝗹𝗲 𝗥𝗲𝗾𝘂𝗶𝗿𝗲𝗱: ${roleText}\n____\n⏳ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${configCommand.countDown || 1}s\n____\n👨‍💻 𝗔𝘂𝘁𝗵𝗼𝗿: ${author}\n____\n📖 𝗨𝘀𝗮𝗴𝗲: ${usage}\n____\n⚠️ 𝗡𝗼𝘁𝗲: 𝗧𝗲𝘅𝘁 𝗶𝗻𝘀𝗶𝗱𝗲 <XXXXX> 𝗶𝘀 𝗰𝗵𝗮𝗻𝗴𝗲𝗮𝗯𝗹𝗲 & [a|b|c] 𝗺𝗲𝗮𝗻𝘀 'a' 𝗼𝗿 'b' 𝗼𝗿 'c'.\n____`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "🌎 𝗔𝗹𝗹 𝗨𝘀𝗲𝗿𝘀";
    case 1: return "👑 𝗚𝗿𝗼𝘂𝗽 𝗔𝗱𝗺𝗶𝗻𝘀";
    case 2: return "🤖 𝗕𝗼𝘁 𝗔𝗱𝗺𝗶𝗻";
    default: return "❓ 𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗥𝗼𝗹𝗲";
  }
    }
