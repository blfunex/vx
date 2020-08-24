const https = require("https");

// It is an eval because prettier keeps formating it to multiple lines. >:(
const [, rng] = eval("Math.random().toFixed(7).split('.')");
const url = `${process.env.PAGES_PUBLIC_URL}?${rng}`;
const content = `Alpha offline singleplayer demo'ish :fingers_crossed: ${url}, might be broken !`;

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
