const mongoose = require("mongoose");

// MongoDB connection string
const dbURI = "mongodb+srv://sonalitravel87:XuVzWW3Kcta9muU0@cluster1.tyoqc.mongodb.net/bankSystem?retryWrites=true&w=majority&appName=Cluster1";

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("[MongoDB] Connected successfully"))
  .catch((err) => console.error("[MongoDB] Connection error:", err));

// Define the Bank schema
const bankSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  bank: { type: Number, default: 0 },
  lastInterestClaimed: { type: Date, default: Date.now },
  loan: { type: Number, default: 0 },
  loanPayed: { type: Boolean, default: true },
});

// Create a model for the Bank schema
const Bank = mongoose.models.Bank || mongoose.model("Bank", bankSchema);


module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit or withdraw money from the bank and earn interest",
    guide: {
      en: "{pn}Bank:\nInterest - Balance\n - Withdraw \n- Deposit \n- Transfer \n- Top",
    },
    category: "💰 Economy",
    countDown: 5,
    role: 0,
    author: "Loufi | SiAM | Samuel | Abir",
  },
  onStart: async function ({ args, message, event, api, usersData }) {
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const userID = event.senderID;

    // Fetch or create user bank data
    let userBankData = await Bank.findOne({ userID });
    if (!userBankData) {
      userBankData = await Bank.create({ userID });
    }

    switch (command) {
      case "deposit":
      case "-d":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❏ Please enter a valid amount to deposit.");
        }

        const userMoney = await usersData.get(userID, "money");
        if (userMoney < amount) {
          return message.reply("❏ You don't have enough money to deposit.");
        }

        userBankData.bank += amount;
        await userBankData.save();

        await usersData.set(userID, { money: userMoney - amount });
        return message.reply(`❏ Successfully deposited $${formatNumberWithFullForm(amount)}.`);

      case "withdraw":
      case "-w":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❏ Please enter a valid amount to withdraw.");
        }

        if (userBankData.bank < amount) {
          return message.reply("❏ You don't have enough money in your bank to withdraw.");
        }

        userBankData.bank -= amount;
        await userBankData.save();

        const updatedMoney = await usersData.get(userID, "money");
        await usersData.set(userID, { money: updatedMoney + amount });

        return message.reply(`❏ Successfully withdrew $${formatNumberWithFullForm(amount)}. Your new bank balance is $${formatNumberWithFullForm(userBankData.bank)}.`);

      case "balance":
      case "bal":
        return message.reply(`❏ You have $${formatNumberWithFullForm(userBankData.bank)} in the bank.`);

      case "interest":
      case "i":
        const interestRate = 0.001; // 0.1% daily interest
        const lastClaimed = userBankData.lastInterestClaimed || Date.now();
        const timeElapsed = (Date.now() - lastClaimed) / (1000 * 60 * 60 * 24); // Days elapsed

        if (timeElapsed < 1) {
          return message.reply("❏ You can claim interest only once every 24 hours.");
        }

        const interest = userBankData.bank * interestRate * timeElapsed;
        userBankData.bank += interest;
        userBankData.lastInterestClaimed = Date.now();
        await userBankData.save();

        return message.reply(`❏ You earned $${formatNumberWithFullForm(interest.toFixed(2))} in interest. Your new bank balance is $${formatNumberWithFullForm(userBankData.bank)}.`);
 case "transfer":
 case "-t":
            if (isNaN(amount) || amount <= 0) {
              return message.reply("[🏦 Bank 🏦]\n\n❏Please enter a valid amount to transfer 🔁•");
            }
          
            if (!recipientUID || !bankData[recipientUID]) {
              return message.reply("[🏦 Bank 🏦]\n\n❏Recipient not found in the bank database. Please check the recipient's ID ✖️•");
            }
          
            if (recipientUID === user) {
              return message.reply("[🏦 Bank 🏦]\n\n❏You cannot transfer money to yourself 😹•");
            }
  case "top":
     const topUsers = await Bank.find().sort({ bank: -1 }).limit(10);
        const leaderboard = await Promise.all(topUsers.map(async (user, index) => {
          const userName = await usersData.get(user.userID, "name");
          return `${index + 1}. ${userName} - $${formatNumberWithFullForm(user.bank)}`;
        }));

        return message.reply(`❏ 𝐓𝐨𝐩 𝟏𝟎 𝐁𝐚𝐧𝐤 𝐁𝐚𝐥𝐚𝐧𝐜𝐞𝐬 :\n\n${leaderboard.join('\n')}`);

      default:
        return message.reply("❏ Invalid command. Use: deposit, withdraw, balance, interest, top.");
    }
  },
};

function formatNumberWithFullForm(number) {
  const fullForms = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"];
  let index = 0;

  while (number >= 1000 && index < fullForms.length - 1) {
    number /= 1000;
    index++;
  }

  return `${number.toFixed(1)}${fullForms[index]}`;
}
