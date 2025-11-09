const fetch = globalThis.fetch;
const url = "https://jygnmkuezhhuycecnfef.supabase.co/functions/v1/app-router";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U";
const accessToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImdGRFhMV2h3YnRMYjZpbUYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2p5Z25ta3VlemhodXljZWNuZmVmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2ODcwMTUyZS1jOTA3LTQ4ZDItOWQ1OC0xYzU5MjRhNzkzMmUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyNjY2NzczLCJpYXQiOjE3NjI2NjMxNzMsImVtYWlsIjoiZGVidWctMTc2MjY2MzEzNzEyMEBzdHVkeXN5bmMuZGV2IiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjI2NjMxNzN9XSwic2Vzc2lvbl9pZCI6ImUxZjYwOGY4LTJjZmUtNDhiYS1hNWI2LTllMDhiYzk5MDExYiIsImlzX2Fub255bW91cyI6ZmFsc2V9.C6b84s9VjScOCtxjZmcZ69NLexkDtAUy7hmkGX1v0no";

const run = async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action: "dashboard.load" }),
  });

  const text = await res.text();
  console.log("status", res.status);
  console.log("headers", Object.fromEntries(res.headers.entries()));
  console.log("body", text);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
