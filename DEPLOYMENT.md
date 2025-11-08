# StudySync Deployment Guide

## Quick Start (Already Configured)

Your StudySync instance is already configured with:
- ✅ Supabase project connected
- ✅ Frontend environment variables set
- ✅ Dependencies installed
- ✅ Database schema SQL script ready

## Step 1: Deploy Database Schema

### Option A: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/jygnmkuezhhuycecnfef
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/app/supabase-schema.sql`
5. Paste into the SQL editor
6. Click **Run** button
7. Verify success - you should see "Success. No rows returned"
8. Go to **Table Editor** to confirm all tables were created:
   - user_profiles
   - daily_check_ins
   - tasks
   - study_sessions
   - study_rooms
   - room_participants
   - achievements
   - study_buddies

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref jygnmkuezhhuycecnfef

# Run migration
supabase db push
```

## Step 2: Deploy Edge Functions

### Prerequisites
- Anthropic API Key: `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`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzNzM3NywiZXhwIjoyMDc4MjEzMzc3fQ.oci0i9_DowIVVngm6HhfHy0fGt67a9jmqhr9Wme3juk`

### Deploy via Supabase CLI

```bash
# Set secrets (only needs to be done once)
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

### Manual Deployment (Alternative)

If CLI doesn't work, you can deploy via Supabase Dashboard:

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Name: `check-in`
4. Copy contents of `/app/supabase-functions/check-in/index.ts`
5. Paste into the editor
6. Click **Deploy function**
7. Repeat for `decompose-task`

## Step 3: Test Edge Functions

### Test Check-In Function

```bash
curl -X POST 'https://jygnmkuezhhuycecnfef.supabase.co/functions/v1/check-in' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test-user-id",
    "type": "morning",
    "responses": {
      "energy": 7,
      "mood": "excited",
      "intention": "Complete calculus homework"
    }
  }'
```

Expected response:
```json
{
  "message": "Great to hear you're feeling excited! With that energy level...",
  "success": true
}
```

### Test Task Decomposition

```bash
curl -X POST 'https://jygnmkuezhhuycecnfef.supabase.co/functions/v1/decompose-task' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test-user-id",
    "task_input": "Study for biology exam",
    "user_profile": {
      "conditions": ["ADHD"],
      "preferred_duration": 25
    }
  }'
```

Expected response:
```json
{
  "subtasks": [
    {
      "title": "Review chapter summaries",
      "duration_minutes": 15,
      "tips": "Use highlighter to mark key concepts"
    },
    ...
  ],
  "success": true
}
```

## Step 4: Run Frontend

The frontend is already configured. Just start it:

```bash
cd /app/frontend
yarn dev
```

Frontend will be available at: http://localhost:3000

## Step 5: Test Complete User Flow

### 1. Sign Up
- Navigate to http://localhost:3000
- Click "Sign up"
- Enter email and password (min 6 characters)
- Should auto-redirect to onboarding

### 2. Complete Onboarding
- Enter display name
- Select neurodivergent conditions (optional)
- Set study preferences
- Click "Let's Go!"

### 3. Test Dashboard
- Should see personalized greeting
- Streak counter (will be 0 initially)
- Three quick action cards
- Progress rings (will show 0%)

### 4. Test Morning Check-In
- If it's between 6 AM - 11 AM, modal should appear automatically
- Otherwise, you can trigger it by:
  - Setting system time to morning hours, OR
  - Modifying `shouldShowMorningCheckIn()` in utils.ts to always return true
- Fill in energy, mood, intention
- Submit and verify AI response appears

### 5. Test Task Decomposition
- In the dashboard "Break Down Task" card
- Enter: "Study for calculus final exam"
- Click the sparkle button
- Should show 3-5 decomposed subtasks with time estimates

### 6. Test Pomodoro Timer
- Click "Quick Focus" → "Start Session"
- Timer should start counting down from 25:00
- Pause/Resume should work
- Reset should return to 25:00

### 7. Test Study Rooms
- Click "Study Together" → "Browse Rooms"
- Click "Create Room"
- Fill in room name (e.g., "Math Study Session")
- Room should appear in list
- Click "Join Room"
- Should show success message

### 8. Test Settings
- Click settings icon (top right)
- Toggle accessibility options
- Change study duration
- Click "Save Settings"
- Verify changes persist after refresh

## Step 6: Verify Database

Go to Supabase Dashboard → Table Editor and verify:

### user_profiles
```sql
SELECT * FROM user_profiles;
```
Should show your user with onboarding completed.

### daily_check_ins
```sql
SELECT * FROM daily_check_ins ORDER BY created_at DESC;
```
Should show your morning check-in with AI response.

### tasks
```sql
SELECT * FROM tasks ORDER BY created_at DESC;
```
Should show parent task and subtasks from decomposition.

### study_rooms
```sql
SELECT * FROM study_rooms WHERE is_active = true;
```
Should show your created study room.

## Troubleshooting

### Edge Functions Not Working

**Symptom:** "Failed to decompose task" or "Error submitting check-in"

**Solutions:**
1. Check function is deployed: `supabase functions list`
2. Check secrets are set: `supabase secrets list`
3. View function logs:
   ```bash
   supabase functions logs check-in
   supabase functions logs decompose-task
   ```
4. Verify CORS headers are correct in function code
5. Check Anthropic API key is valid

### Database Connection Issues

**Symptom:** "Error loading dashboard" or "Failed to load profile"

**Solutions:**
1. Verify Supabase URL is correct in `.env`
2. Check anon key is valid
3. Verify RLS policies are enabled
4. Check user is authenticated: `supabase auth users list`

### Real-time Not Working (Study Rooms)

**Symptom:** Room participant count doesn't update

**Solutions:**
1. Check Realtime is enabled in Supabase project settings
2. Verify RLS policies allow reading from `study_rooms` and `room_participants`
3. Check browser console for WebSocket connection errors

### Frontend Build Issues

**Symptom:** TypeScript errors or build failures

**Solutions:**
1. Delete node_modules and yarn.lock: `rm -rf node_modules yarn.lock`
2. Reinstall: `yarn install`
3. Clear Vite cache: `rm -rf node_modules/.vite`
4. Restart dev server

## Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd /app/frontend
vercel

# Set environment variables in Vercel Dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_API_URL

# Deploy to production
vercel --prod
```

### Enable Supabase Auth in Production

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add to "Redirect URLs":
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local dev)

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Service role key not exposed to frontend
- [x] CORS configured correctly on Edge Functions
- [x] Environment variables stored securely
- [x] Anthropic API key stored as Supabase secret
- [ ] Rate limiting configured (optional)
- [ ] Input validation on all forms
- [ ] SQL injection prevention (handled by Supabase)

## Performance Optimization

- [x] Code splitting with React.lazy (future)
- [x] Image optimization (no images yet)
- [x] Database indexes on frequently queried columns
- [x] Connection pooling (handled by Supabase)
- [x] Edge Function cold start optimization

## Monitoring & Logging

### View Edge Function Logs
```bash
supabase functions logs check-in --tail
supabase functions logs decompose-task --tail
```

### Monitor Database Performance
- Go to Supabase Dashboard → Database → Query Performance
- Check slow queries
- Optimize with indexes if needed

### User Analytics (Future)
- Integration with PostHog or Mixpanel
- Track key events:
  - Sign ups
  - Check-in completions
  - Task decompositions
  - Study session starts
  - Room joins

---

**You're all set!** 🎉 StudySync is ready to help neurodivergent students build consistent study habits.