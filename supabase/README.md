# CampusLoop 3.0 Supabase Setup Guide

This guide describes how to connect the development Supabase project (`campusloop-dev`) to CampusLoop 3.0 Phase A.

> [!IMPORTANT]
> **Safety Rule**: Never apply these migrations or configure environment variables against the production database. All Phase A development and testing must target `campusloop-dev`.

---

## 1. Database Migration: Profiles & Auth Triggers

Run the SQL migration in `supabase/migrations/20261028000001_create_profiles.sql`.

### Option A: Via Supabase Dashboard (Recommended for fast setup)
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your development project: **`campusloop-dev`**.
3. In the left navigation, click **SQL Editor**.
4. Click **New Query**.
5. Copy and paste the entire contents of `supabase/migrations/20261028000001_create_profiles.sql`.
6. Click **Run**.
7. Confirm that the `profiles` table is created under the `public` schema and that RLS is enabled with 3 policies.

### Option B: Via Supabase CLI
```bash
# Link to development project (confirm project ref matches campusloop-dev)
npx supabase link --project-ref <your-dev-project-ref>

# Push the migration
npx supabase db push
```

---

## 2. Environment Variables Configuration

1. In your local project root (`c:\Users\akhil\Downloads\Campusloop`), copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Retrieve your project credentials from **Supabase Dashboard** -> **Project Settings** -> **API**:
   - **Project URL**: e.g., `https://abcdefghijklmno.supabase.co`
   - **Project API Keys**: Copy the **`anon` / `public`** key.
   *(Never use the `service_role` secret key!)*
3. Populate `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://<your-dev-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Note: `.env.local` is listed in `.gitignore` and will never be committed to Git.

---

## 3. Auth Configuration in Supabase Dashboard

To support email sign-in and verification:
1. Go to **Authentication** -> **Providers** -> **Email**.
2. Ensure **Enable Email provider** is turned on.
3. For local testing:
   - If **Confirm email** is enabled, new signups will receive a confirmation email with a verification link.
   - For rapid local testing without waiting for email delivery, you can temporarily disable "Confirm email" or inspect sent emails under **Authentication** -> **Inbucket** / Logs.
4. Set **Site URL** under **Authentication** -> **URL Configuration**:
   - Development: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`
