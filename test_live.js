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
.then(res => res.json().then(j => ({ status: res.status, body: j })))
.then(res => {
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
