# CeirGO - Mobile Roaming Service

A modern Next.js application for managing mobile device roaming services with Supabase authentication and storage.

## Features

- 🔐 User authentication with Supabase
- 📱 Device IMEI management
- 💳 Multiple payment methods (BCA, DANA, QRIS)
- 🗂️ File upload for proof of transfer
- 👨‍💼 Admin dashboard
- 🎨 Modern dark-themed UI with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase project with authentication and storage buckets configured
- Environment variables configured

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd CeirGO-FIX
npm install
```

### 2. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Then fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### 3. Database Setup

Run the migration script in Supabase:

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Paste the contents of `supabase/migration.sql`
4. Execute the migration

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── (auth)/         # Authentication routes (login, register)
│   ├── admin/          # Admin dashboard
│   ├── dashboard/      # User dashboard
│   └── page.tsx        # Home page (redirects to dashboard/login)
├── lib/
│   ├── supabase.ts     # Supabase client initialization
│   └── admin.ts        # Admin role utilities
└── middleware.ts       # Request middleware configuration

supabase/
└── migration.sql       # Database migration script
```

## Available Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

## Technology Stack

- **Framework:** Next.js 16.1.6 with App Router
- **UI:** React 19.2.3
- **Styling:** Tailwind CSS 4 + PostCSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Type Safety:** TypeScript 5

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated admin emails | Yes |

## Deployment

### Deploy to Vercel

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAILS`
4. Deploy

[Vercel Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)

## Security Considerations

- ⚠️ Environment variables with `NEXT_PUBLIC_` prefix are visible to the client - only use these for non-sensitive public data
- Sensitive keys should be stored server-side only
- The `.env.local` file is in `.gitignore` and should never be committed
- Authentication is handled client-side with Supabase session management

## License

Proprietary
