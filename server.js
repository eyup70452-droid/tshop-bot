const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

// 🔐 Telegram hash doğrulama
function verifyTelegram(data) {
  const { hash, ...rest } = data;

  const sorted = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  const checkHash = crypto
    .createHmac("sha256", secret)
    .update(sorted)
    .digest("hex");

  return checkHash === hash;
}

// 🔑 Login endpoint
app.post("/auth/telegram", (req, res) => {
  const data = req.body;

  if (!verifyTelegram(data)) {
    return res.status(403).json({ ok: false, error: "invalid auth" });
  }

  // kullanıcı oluştur / döndür
  const user = {
    id: data.id,
    username: data.username || "user",
    points: 5000
  };

  return res.json({ ok: true, user });
});

// test route
app.get("/", (req, res) => {
  res.send("TSHOP backend running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
