# Supabase & Environment Setup

Follow these steps to set up your database and environment variables.

## 1. Supabase Setup
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In your Supabase Dashboard, go to the **SQL Editor**.
3. Create a new query, copy the contents of `supabase_schema.sql` (found in the root of your project), and click **Run**.
4. This will create all the necessary tables for your portfolio.

## 2. Get API Keys
1. Go to **Project Settings** > **API**.
2. Copy the **Project URL** and the **anon public API key**.

## 3. Environment Variables
1. Create a file named `.env.local` in the root of your project.
2. Copy the content from `.env.example` into `.env.local`.
3. Fill in the values:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key.
   - `NEXTAUTH_SECRET`: A random string (you can generate one with `openssl rand -base64 32`).
   - `ADMIN_PASSWORD`: The password you want to use to log in to the admin panel.

## 4. Run the Project
Once updated, run:
```bash
npm run dev
```
And navigate to `http://localhost:3000/admin` to log in!
