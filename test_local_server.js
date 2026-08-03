const data = {
  firstName: "Test",
  lastName: "User",
  email: `test${Date.now()}@example.com`,
  password: "password123",
  pack: "standard"
};

fetch("http://localhost:3000/api/auth/register", {
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
