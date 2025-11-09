const fetch = globalThis.fetch;
const url = "https://jygnmkuezhhuycecnfef.supabase.co/auth/v1/token?grant_type=password";
const email = "debug-1762663137120@studysync.dev";
const password = "TestPass123!";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U";

const run = async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey,
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => null);
  console.log({ status: res.status, data });
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
