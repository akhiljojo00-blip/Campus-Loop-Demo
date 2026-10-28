# CampusLoop 3.0 Supabase Setup & Security Guide

This guide describes how to connect and migrate the development Supabase project (`campusloop-dev`) for CampusLoop 3.0.

> [!IMPORTANT]
> **Safety Rule**: Never apply these migrations or configure environment variables against the production database. All development and testing must target `campusloop-dev`.
> **Zero Secrets Policy**: Never commit `.env.local` or expose `service_role` / administrative keys to the frontend.

---

## 1. Database Migrations

The migrations are located in `supabase/migrations/`:
- `20261028000001_create_profiles.sql`: Base public profiles schema and triggers.
- `20261028000002_security_hardening.sql`: Security hardening migration that:
  1. Isolates private contact data (`user_private_details`) with strict owner-only RLS (`auth.uid() = id`).
  2. Removes wallet balances and phone numbers from public profile queries.
  3. Enforces column-level UPDATE grants to prevent unauthorized column tampering.
  4. Hardens `public.handle_new_user()` and `public.handle_updated_at()` with `SET search_path = ''` and schema qualification.

### How to Apply to `campusloop-dev`

#### Option A: Via Supabase Dashboard SQL Editor (Recommended)
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your development project: **`campusloop-dev`**.
3. In the left navigation, click **SQL Editor** -> **New Query**.
4. If you have **already run** migration 1 previously:
   - Paste and run `supabase/migrations/20261028000002_security_hardening.sql`.
5. If setting up a **fresh development project**:
   - Run `supabase/migrations/20261028000001_create_profiles.sql`, followed by `20261028000002_security_hardening.sql`.

#### Option B: Via Supabase CLI
```bash
# Link to development project (confirm project ref matches campusloop-dev)
npx supabase link --project-ref <your-dev-project-ref>

# Push the migrations
npx supabase db push
```

---

## 2. Environment Variables Configuration

1. In your local project root (`c:\Users\akhil\Downloads\Campusloop`), create or update `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Retrieve your project credentials from **Supabase Dashboard** -> **Project Settings** -> **API**:
   - **Project URL**: e.g., `https://abcdefghijklmno.supabase.co`
   - **Project API Keys**: Copy the **Publishable** or **`anon` / `public`** key.
   *(Never use the `service_role` secret key!)*
3. Populate `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://<your-dev-project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key-here
   ```
4. Note: `.env.local` is listed in `.gitignore` and will never be committed to Git.

---

## 3. Data Boundaries & Security Model

| Data Class | Table | Access Level | Protected By |
| :--- | :--- | :--- | :--- |
| **Public Profiles** | `public.profiles` | Public read (name, dept, location, avatar, bio) | Column Grants + RLS (`SELECT USING true`) |
| **Private Contacts** | `public.user_private_details` | Owner only (phone number) | Strict RLS (`auth.uid() = id`) |
| **Virtual Wallet** | Deferred to authoritative ledger | Server-authoritative | Isolated from client profile updates |
