module.exports = {
  config: {
    name: "slot",
    version: "1.0",
    author: "SAIDUL",
    countDown: 10,
    shortDescription: {
      en: "Slot game",
    },
    longDescription: {
      en: "Gamble at the risk of losing or winning.",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to have a chance to win double.",
      limit_amount : "Minimum bet amount is 1k",
      not_enough_money: "Check your balance to ensure you have that amount.",
      spin_message: "Spinning...",
      win_message: "You won $%1, buddy!",
      lose_message: "You lost $%1, buddy.",
      jackpot_message: "Jackpot! You won $%1 with three %2 symbols, buddy!",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 1000) {
      return message.reply(getLang("limit_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const slots = ["🍭", "🧃", "💎", "💎", "⭐", "🍯", "🍯", "🫐", "🍎"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, amount);
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);
    return message.reply(messageText);
  },
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  const randomOutcome = Math.random();

  if (randomOutcome < 0.8) {
    return -betAmount;
  }

  if (slot1 === "🍒" && slot2 === "🍉" && slot3 === "🍒") {
    return betAmount * 5;
  } else if (slot1 === "🍋" && slot2 === "🍉" && slot3 === "🍉") {
    return betAmount * 4;
  } else if (slot1 === slot2 && slot2 === slot3 && slot1 === slot3) {
    return betAmount * 2;
  } else {
    return -betAmount;
  }
}

function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  const slotsDisplay = `[ ${slot1} | ${slot2} | ${slot3} ]`;
  if (winnings > 0) {
    if (slot1 === "🍏" && slot2 === "🍊" && slot3 === "🍊") {
      return getLang("jackpot_message", winnings, "🍹") + ` ${slotsDisplay}`;
    } else {
      return getLang("win_message", winnings) + ` ${slotsDisplay}`;
    }
  } else {
    return getLang("lose_message", -winnings) + ` ${slotsDisplay}`;
  }
}
