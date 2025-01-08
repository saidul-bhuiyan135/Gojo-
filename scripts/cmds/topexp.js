module.exports = {
  config: {
    name: "topexp",
    version: "1.0",
    author: "OTINXSANDIP",
    role: 0,
    shortDescription: {
      en: "Top 10 Ranks"
    },
    longDescription: {
      en: ""
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, args, message, event, usersData }) {
    const allUsers = await usersData.getAll();

    // Filter out users with no experience points
    const usersWithExp = allUsers.filter(user => user.exp > 0);

    if (usersWithExp.length < 10) {
      message.reply("There are not enough users with experience points to display a top 10.");
      return;
    }

    const topExp = usersWithExp.sort((a, b) => b.exp - a.exp).slice(0, 10);

    const topUsersList = topExp.map((user, index) => `${index + 1}. ${user.name}: ${user.exp}`);

    const messageText = `𝐓𝐨𝐩 𝟏𝟎 𝐑𝐚𝐧𝐤𝐬 \n${topUsersList.join('\n')}`;

    message.reply(messageText);
  }
};