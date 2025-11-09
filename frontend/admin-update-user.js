const fetch = globalThis.fetch;
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNzM3NywiZXhwIjoyMDc4MjEzMzc3fQ.oci0i9_DowIVVngm6HhfHy0fGt67a9jmqhr9Wme3juk";
const userId = "0d873bc2-d6a7-4a2f-a5c1-f529c130c612";
const password = "TestPass123!";

const run = async () => {
  const res = await fetch(`https://jygnmkuezhhuycecnfef.supabase.co/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ password, email_confirm: true }),
  });
  const text = await res.text();
  console.log("status", res.status);
  console.log("body", text);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
