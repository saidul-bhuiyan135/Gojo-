const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ 🐐 | GoatBot V2 ]";

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "NTKhang", // original author Kshitiz
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `╔══════════════╗\n🎀𝓙𝓮𝓻𝓻𝔂🎀\n╚══════════════╝\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭────────────⭓\n│『 ${category.toUpperCase()} 』\n`;

          const names = categories[category].commands.sort();
          names.forEach((cmd) => {
            msg += `│🎀${cmd}🎀\n`;
          });

          msg += "╰────────⭓\n";
        }
      });

      const totalCommands = commands.size;
      msg += `\n𝗖𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆, 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗵𝗮𝘀 ${totalCommands} 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝘁𝗵𝗮𝘁 𝗰𝗮𝗻 𝗯𝗲 𝘂𝘀𝗲𝗱.\n`;
      msg += `𝗧𝘆𝗽𝗲 ${prefix}𝗵𝗲𝗹𝗽 <𝗰𝗺𝗱𝗡𝗮𝗺𝗲> 𝘁𝗼 𝘃𝗶𝗲𝘄 𝗱𝗲𝘁𝗮𝗶𝗹𝘀 𝗼𝗳 𝗮 𝗰𝗼𝗺𝗺𝗮𝗻𝗱.\n🎀𝓙𝓮𝓻𝓻𝔂🎀`;

      const helpListImages = ["https://i.imgur.com/8d6WbRJ.gif"];
      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage),
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription =
          configCommand.longDescription?.en || "No description available.";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{pn}/g, prefix).replace(/{cmdName}/g, configCommand.name);

        const response = `╭── NAME ────⭓
  │ ${configCommand.name}
  ├── INFO
  │ Description: ${longDescription}
  │ Aliases: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}
  │ Version: ${configCommand.version || "1.0"}
  │ Role: ${roleText}
  │ Cooldown: ${configCommand.countDown || 1}s
  │ Author: ${author}
  ├── USAGE
  │ ${usage}
  ├── NOTES
  │ <XXXXX> can be changed.
  │ [a|b|c] means choose between a, b, or c.
  ╰━━━━━━━❖`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
}
