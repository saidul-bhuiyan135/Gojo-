module.exports = {
  config: {
    name: 'poli',
    author: 'Nyx',
    category: 'tools', 
    description: 'This command generates an image based on a prompt.', // সংক্ষিপ্ত বর্ণনা
    usage: '<prompt>', 
    cooldown: 5,
  },
  onStart: async ({ args, message }) => {
    const axios = require('axios');

    try {
      const prompt = args.join(' ');
      if (!prompt) return message.reply('Please provide a prompt.');
      const response = await axios.get(`${global.GoatBot.config.api}api/poli?prompt=${encodeURIComponent(prompt)}`);
      const { Image } = response.data;

      if (!Image) return message.reply('Failed to generate an image. Please try again.');

      message.reply({
        body: `Here is your generated image for: "${prompt}"`,
        attachment: await global.utils.getStreamFromURL(Image),
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while processing your request. Please try again later.');
    }
  },
};
