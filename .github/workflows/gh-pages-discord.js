const https = require("https");

// It is an eval because prettier keeps formating it to multiple lines. >:(
const [, rng] = eval("Math.random().toFixed(7).split('.')");
const url = `${process.env.PAGES_PUBLIC_URL}?${rng}`;

const templates = [
  () => `Hope this works :fingers_crossed:. ${url}`,
  () => `Prepare for a browser tab crash :desktop::fire:. ${url}`,
  () => `free hosting is provided by GitHub Pages. ${url} :bank::money_with_wings:`,
  () => `Demo time ! ${url} :joystick:`,
  () => `I hope that I finish this soon so I can play ${url} :video_game:`,
  () => `:bee: Do you like jazz ? ${url}`
];

const content = templates[(Math.random() * templates.length) | 0]();

const payload = JSON.stringify({
  content,
  username: "blfunex",
  avatar_url:
    "https://avatars3.githubusercontent.com/u/11468624?s=460&u=e53e30356e49369510a3bdab9edf8f64ed81f971&v=4"
});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": payload.length
  }
};

console.log(options, payload);

const req = https.request(process.env.DISCORD_DEMO_WEBHOOK, options, res => {
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
