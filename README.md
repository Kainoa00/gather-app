# Parent Planner

One secure place to manage the logistics of your parents' care.

## Features

- **Care Calendar**: Track appointments with "I'll do it" claim buttons
- **Care Circle**: Role-based access for family members and caregivers
- **The Vault**: Encrypted storage for insurance, medications, and access codes
- **Incident Feed**: Searchable health update log

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (optional - works in demo mode without)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables (Optional)

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app works in demo mode without Supabase - data is stored locally in the browser.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/parent-planner)

## License

MIT
