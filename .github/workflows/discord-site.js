const https = require("https");

const rng = Math.random()
  .toFixed(7)
  .split(".")[1];

const message = JSON.stringify({
  content:
    "This is a demo build of my prototype, use the following link if the the automated one is outdated " +
    process.env.PAGES_PUBLIC_URL +
    "?" +
    rng,
  username: "Umph's Janky Bot",
  avatar_url:
    "https://a.thumbs.redditmedia.com/JZ45VzdaAhKYaIFzOXH8AZUFHsxZnexpY4seH_3xwY0.png"
});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": message.length
  }
};

console.log(options, message);

const req = https.request(process.env.DISCORD_WEBHOOK, options, res => {
  console.log(`Webhook status: ${res.statusCode}`);
  res.on("data", data => {
    process.stdout.write(data);
  });
});

req.on("error", error => {
  console.error(error);
});

req.write(message);
req.end();
