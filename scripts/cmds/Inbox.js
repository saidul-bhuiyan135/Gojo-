module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "saidul",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "okh enjoy saidul cmd"
    },
    longDescription: {
      en: ""
    },
    category: "fun",
    guide: {
      en: ""
    }
  },
  langs: {
    en: {
      gg: ""
    },
    id: {
      gg: ""
    }
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const query = encodeURIComponent(args.join(' '));
      message.reply("✅ SUCCESSFULLY SEND MSG\n\n🔰 PLEASE CK YOUR INBOX OR MSG requested  BOX", event.threadID);
      api.sendMessage("✅ SUCCESSFULLY ALLOW\n🔰 NOW YOU CAN USE🫠 HI I'M SAIDUL BOT🫠 HERE", event.senderID);
    } catch (error) {
      console.error("Error bro: " + error);
    }
  }
}
