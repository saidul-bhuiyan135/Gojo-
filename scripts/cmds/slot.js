module.exports = {
  config: {
    name: "slot",
    version: "1.0",
    author: "OtinXSandip",
    shortDescription: {
      en: "Slot game",
    },
    longDescription: {
      en: "Slot game.",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to have a chance to win double",
      not_enough_money: "Check your balance if you have that amount",
      spin_message: "Spinning...",
      win_message: "You won $%1, buddy!",
      lose_message: "You lost $%1, buddy.",
      jackpot_message: "Jackpot! You won $%1 with three %2 symbols, buddy!",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // স্লট সিম্বলস
    const slots = ["💚", "💛", "💙"];
    
    // স্লটগুলো র্যান্ডম ভাবে নির্বাচন
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    // প্রাপ্ত জেতার পরিমাণ
    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    // ব্যবহারকারীর নতুন অর্থ আপডেট করা
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    // স্পিন ফলাফল
    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);

    return message.reply(messageText);
  },
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  const randomOutcome = Math.random();

  // যদি হারানোর সম্ভাবনা (0-49%)
  if (randomOutcome < 0.5) {
    return -betAmount; // হারানো
  }

  // যদি জেতার সম্ভাবনা (50-100%)
  if (slot1 === slot2 && slot2 === slot3) {
    if (slot1 === "💚") {
      return betAmount * 10; // 💚 স্লট, ১০ গুণ
    } else if (slot1 === "💛") {
      return betAmount * 5; // 💛 স্লট, ৫ গুণ
    } else {
      return betAmount * 3; // 💙 স্লট, ৩ গুণ
    }
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 2; // ২টি স্লট এক রকম হলে ২ গুণ
  } else {
    return -betAmount; // স্লটগুলো আলাদা হলে হারানো
  }
}

function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  if (winnings > 0) {
    if (slot1 === "💙" && slot2 === "💙" && slot3 === "💙") {
      return getLang("jackpot_message", winnings, "💙");
    } else {
      return getLang("win_message", winnings) + `\[ ${slot1} | ${slot2} | ${slot3} ]`;
    }
  } else {
    return getLang("lose_message", -winnings) + `\[ ${slot1} | ${slot2} | ${slot3} ]`;
  }
}
