const https = require("https");

// It is an eval because prettier keeps formating it to multiple lines. >:(
const [, rng] = eval("Math.random().toFixed(7).split('.')");
const url = `${process.env.PAGES_PUBLIC_URL}?${rng}`;
const content = `Alpha offline singleplayer demo'ish :fingers_crossed: ${url}, might be broken !`;

const payload = JSON.stringify({
  content,
  username: "Butter Bot",
  avatar_url:
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatici.behindthevoiceactors.com%2Fbehindthevoiceactors%2F_img%2Fchars%2Fthumbs%2Fbutter-bot-rick-and-morty-65.7_thumb.jpg&f=1&nofb=1"
});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": payload.length
  }
};

console.log(options, payload);

const req = https.request(process.env.DISCORD_WEBHOOK, options, res => {
  console.log(`Webhook status: ${res.statusCode}`);
  res.on("data", data => {
    process.stdout.write(data);
  });
});

req.on("error", error => {
  console.error(error);
});

req.write(payload);
req.end();
