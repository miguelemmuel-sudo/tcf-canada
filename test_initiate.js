const data = {
  pack: "griffon",
  userId: "b5d2147f-35ca-407d-92df-1260736dd458",
  email: "test_live_123@example.com"
};

fetch("https://griffondortcfcanada.com/api/fapshi/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
.then(async res => {
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("BODY:", text);
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
