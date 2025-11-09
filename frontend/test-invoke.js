const fetch = globalThis.fetch;
const url = "https://jygnmkuezhhuycecnfef.supabase.co/functions/v1/app-router";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U";

(async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey,
      Authorization: `Bearer ${apikey}`,
    },
    body: JSON.stringify({ action: "dashboard.load" }),
  });
  console.log("status", res.status);
  const text = await res.text();
  console.log("raw", text);
})();
