const fetch = globalThis.fetch;
const url = "https://jygnmkuezhhuycecnfef.supabase.co/auth/v1/admin/users";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNzM3NywiZXhwIjoyMDc4MjEzMzc3fQ.oci0i9_DowIVVngm6HhfHy0fGt67a9jmqhr9Wme3juk";

const email = `debug-${Date.now()}@studysync.dev`;
const password = "TestPass123!";

const run = async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  const data = await res.json().catch(() => null);
  console.log({ status: res.status, email, data });
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
