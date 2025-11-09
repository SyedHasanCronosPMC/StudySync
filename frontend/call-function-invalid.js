const fetch = globalThis.fetch;
const url = "https://jygnmkuezhhuycecnfef.supabase.co/functions/v1/app-router";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U";

const run = async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey,
      Authorization: "Bearer invalid",
    },
    body: JSON.stringify({ action: "dashboard.load" }),
  });
  const text = await res.text();
  console.log("status", res.status);
  console.log("body", text);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
