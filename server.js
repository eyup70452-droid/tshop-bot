const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram bot
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

// Basit test route (Render alive check için)
app.get("/", (req, res) => {
  res.send("Bot aktif ✅");
});

// Telegram mesaj sistemi
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  if (text === "/start") {
    bot.sendMessage(chatId, "Hoş geldin 👋 Bot çalışıyor ✅");
  } else {
    bot.sendMessage(chatId, "Mesaj alındı: " + text);
  }
});

// Server başlat (Render için gerekli)
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  console.log("Telegram bot aktif");
});
