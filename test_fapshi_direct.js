const FAPSHI_API_USER = "d0a0c853-d1f7-45af-9f15-a73965d4b26c";
const FAPSHI_API_KEY = "FAK_ef15a60ad5b70e4f95457405f00520e2";
const endpoint = "https://live.fapshi.com/initiate-pay";

const body = {
  amount: 25000,
  email: "test@example.com",
  externalId: "TEST_" + Date.now(),
  message: "Test Fapshi API"
};

const start = Date.now();
fetch(endpoint, {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "apiuser": FAPSHI_API_USER,
    "apikey": FAPSHI_API_KEY
  },
  body: JSON.stringify(body)
})
.then(async res => {
  const time = Date.now() - start;
  const data = await res.text();
  console.log(`Fapshi took ${time} ms. STATUS: ${res.status}`);
  console.log("BODY:", data);
  process.exit(0);
})
.catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
