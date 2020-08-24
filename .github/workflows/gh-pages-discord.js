const https = require("https");

// It is an eval because prettier keeps formating it to multiple lines. >:(
const [, rng] = eval("Math.random().toFixed(7).split('.')");
const url = `${process.env.PAGES_PUBLIC_URL}?${rng}`;
const content = `Project is still in alpha,
but you can test a singleplayer version of it here ${url}`;

const payload = JSON.stringify({
  content,
  username: "Umph's Janky Bot",
  avatar_url:
    "https://a.thumbs.redditmedia.com/JZ45VzdaAhKYaIFzOXH8AZUFHsxZnexpY4seH_3xwY0.png"
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
