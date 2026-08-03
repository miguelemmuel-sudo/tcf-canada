const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  if (line && line.includes('=')) {
    const parts = line.split('=');
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
}

const endpoint = "https://live.fapshi.com/initiate-pay";
const bodyPayload = {
  amount: 15000,
  email: "test@example.com",
  externalId: "TCF_12345",
  message: "Test payment",
  redirectUrl: "https://google.com"
};

fetch(endpoint, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    apiuser: env.FAPSHI_API_USER,
    apikey: env.FAPSHI_API_KEY,
  },
  body: JSON.stringify(bodyPayload),
})
.then(res => res.json().then(j => ({ status: res.status, body: j })))
.then(res => {
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
