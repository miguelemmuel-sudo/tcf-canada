const data = {
  firstName: "Test",
  lastName: "Live",
  email: `test_live_${Date.now()}@example.com`,
  password: "password123",
  pack: "standard"
};

fetch("https://griffondortcfcanada.com/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
.then(async res => {
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("HEADERS:", res.headers);
  console.log("BODY:", text);
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
