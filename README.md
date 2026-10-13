# fvlnzm.my, my portfolio and CMS

My personal portfolio site with its own admin dashboard. Every section of the site (projects, blog, skills, experience, education, certifications, testimonials) is stored in Supabase, so I can update the site from `/admin` without touching code.

**Live:** [fvlnzm.my](https://fvlnzm.my)

<img width="1708" height="977" alt="image" src="https://github.com/user-attachments/assets/a708f554-c941-40dd-afaa-40e2d11573d7" />


## Features

**Public site**
- Home page with hero, about, services, tech stack, projects, testimonials, blog preview and contact
- Project pages at `/projects/[slug]` with details and image previews
- Blog with individual post pages
- Light and dark theme

**Admin dashboard** (`/admin`)
- Login protected with NextAuth
- Create, edit and delete content for 10 sections: profile, about, projects, blogs, skills, experience, education, certifications, hobbies and testimonials
- Blog post preview before publishing

**API**
- REST routes under `/api/*` for each content type, backed by Supabase

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | Supabase (Postgres) |
| Auth | NextAuth with bcrypt-hashed admin password |
| Styling | Tailwind CSS, Lucide icons |

## Project structure

```
src/
├── app/
│   ├── admin/        # dashboard pages and login
│   ├── api/          # REST routes, one folder per content type
│   ├── blog/         # public blog
│   └── projects/     # public project pages
├── components/       # Home, Blog and Admin UI components
├── context/          # theme context
└── lib/              # Supabase client and auth config
```

## Running it locally

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project, open the SQL editor and run `supabase_schema.sql`, then the other `.sql` files.
3. Copy `.env.example` to `.env.local` and fill in your Supabase URL, anon key, `NEXTAUTH_SECRET` and `ADMIN_PASSWORD`.
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`. The dashboard is at `/admin`.

Full setup notes are in [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).

## Author

**Muhammad Naufal Mohd Nizam**, Intelligent System Engineering student at UiTM
[Portfolio](https://fvlnzm.my) · [LinkedIn](https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279)
