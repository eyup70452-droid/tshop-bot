const { Telegraf } = require("telegraf");

// BURAYA BOT TOKENİNİ KOY
const bot = new Telegraf("8793331286:AAE4RnOgdOkTiefON24OB4W9vK1KJpKocmc");

const users = {};

bot.start((ctx) => {
  const id = ctx.from.id;

  users[id] = {
    username: ctx.from.username,
    points: 500
  };

  ctx.reply("Giriş yapıldı ✅\nID: " + id);
});

bot.on("text", (ctx) => {
  ctx.reply("Bot çalışıyor ✅");
});

bot.launch();
