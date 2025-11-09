# StudySync Supabase Deployment Guide

## Quick Deploy (Copy-Paste Ready)

### Step 1: Deploy Database Schema (5 minutes)

**Option A: Supabase Dashboard (Recommended)**

1. Open: https://supabase.com/dashboard/project/jygnmkuezhhuycecnfef
2. Click: **SQL Editor** (left sidebar)
3. Click: **New Query**
4. Copy the ENTIRE contents of `/app/supabase-schema-fixed.sql`
5. Paste into the editor
6. Click: **RUN** (bottom right)
7. Wait for "Success. No rows returned" message
8. Verify: Go to **Table Editor** → Should see 8 tables

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login (will open browser)
supabase login

# Link to your project
supabase link --project-ref jygnmkuezhhuycecnfef

# Push the schema
supabase db push --include-all
```

### Step 2: Deploy Edge Functions (10 minutes)

**IMPORTANT: Edge Functions must be deployed from your local machine, not in this environment**

```bash
# Set environment secrets (only once)
supabase secrets set ANTHROPIC_API_KEY="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"

supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNzM3NywiZXhwIjoyMDc4MjEzMzc3fQ.oci0i9_DowIVVngm6HhfHy0fGt67a9jmqhr9Wme3juk"

supabase secrets set SUPABASE_URL="https://jygnmkuezhhuycecnfef.supabase.co"

# Deploy check-in function
supabase functions deploy check-in --project-ref jygnmkuezhhuycecnfef

# Deploy decompose-task function
supabase functions deploy decompose-task --project-ref jygnmkuezhhuycecnfef

# Verify deployment
supabase functions list
```

**Manual Alternative (If CLI doesn't work):**

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **Create a new function**
3. Name: `check-in`
4. Copy contents of `/app/supabase-functions/check-in/index.ts`
5. Paste and click **Deploy**
6. Repeat for `decompose-task`
7. In **Settings → Environment Variables**, add:
   - ANTHROPIC_API_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_URL

### Step 3: Configure Supabase Auth for Emergent Preview

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://studypal-86.preview.emergentagent.com`
3. Add to **Redirect URLs**:
   - `https://studypal-86.preview.emergentagent.com/**`
   - `http://localhost:3000/**`

### Step 4: Test Your App

1. **Open:** https://studypal-86.preview.emergentagent.com
2. **Landing page should load** (dark theme, purple gradients)
3. **Click:** "Get Started Free"
4. **Sign up** with test email (e.g., test@example.com)
5. **Complete onboarding** (3 steps)
6. **Verify dashboard loads** with streak counter

## Troubleshooting

### Issue: "Failed to create user profile"
**Solution:** Run the trigger function in SQL editor:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Issue: "Edge Function not found"
**Solution:** Verify functions are deployed:
```bash
supabase functions list
```

### Issue: "CORS error" 
**Solution:** Edge Functions include CORS headers already. Check that functions are deployed.

### Monitoring & Alerts
- GitHub Actions (`.github/workflows/ci.yml`) runs lint/build checks automatically—monitor the Actions tab for failures.
- In Supabase Dashboard → **Observability → Alerts**, add saved queries for:
  - `metadata.function_name = 'check-in' AND metadata.status_code >= 400`
  - `event:app-router.error`
- Configure Slack or email notifications so production failures surface quickly.
- Provide `VITE_SENTRY_DSN` (see README) to capture frontend exceptions in Sentry.

## Files Ready for Download

All files are in `/app/` and ready to download:
- `supabase-schema-fixed.sql` - Fixed schema (correct table order)
- `supabase-functions/check-in/index.ts` - Morning/evening check-in
- `supabase-functions/decompose-task/index.ts` - Task breakdown

To download and deploy from your local machine:

```bash
# Download the repo
git clone <your-repo-url>
cd studysync

# Deploy Edge Functions
cd supabase-functions
supabase functions deploy check-in
supabase functions deploy decompose-task
```

## Success Checklist

- [ ] Database schema deployed (8 tables visible in Table Editor)
- [ ] RLS policies enabled (check in Table Editor → table → RLS tab)
- [ ] Trigger function created (new users auto-get profiles)
- [ ] Edge Functions deployed (visible in Edge Functions tab)
- [ ] Secrets set (ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Auth URLs configured (Site URL + Redirect URLs)
- [ ] App loads at preview URL
- [ ] Sign up works
- [ ] Onboarding completes
- [ ] Dashboard shows

---

**Once database and Edge Functions are deployed, StudySync will be fully functional!** 🚀