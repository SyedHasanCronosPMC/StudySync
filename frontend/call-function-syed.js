const fetch = globalThis.fetch;
const url = "https://jygnmkuezhhuycecnfef.supabase.co/functions/v1/app-router";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U";
const accessToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImdGRFhMV2h3YnRMYjZpbUYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2p5Z25ta3VlemhodXljZWNuZmVmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwZDg3M2JjMi1kNmE3LTRhMmYtYTVjMS1mNTI5YzEzMGM2MTIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyNjY3MDU5LCJpYXQiOjE3NjI2NjM0NTksImVtYWlsIjoic3llZC5oYXNhbkBvdXRsb29rLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJzeWVkLmhhc2FuQG91dGxvb2suY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiMGQ4NzNiYzItZDZhNy00YTJmLWE1YzEtZjUyOWMxMzBjNjEyIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjI2NjM0NTl9XSwic2Vzc2lvbl9pZCI6IjUxYTAzN2NlLTdmMWEtNDYzMy1hMjY5LTkyYWZkZWQ5YjZjZiIsImlzX2Fub255bW91cyI6ZmFsc2V9.mAiI0S3oRgQcU4YowlNiVUAIGHibuXBngdZm3zf2Jno";

const run = async () => {
  for (const action of ["dashboard.load", "habit.summary"]) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action, payload: action === "habit.summary" ? { days: 7 } : undefined }),
    });
    const text = await res.text();
    console.log(action, "status", res.status);
    console.log(action, "body", text);
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
