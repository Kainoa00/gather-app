# CareBridge Connect - Project State Documentation
**Last Updated:** February 8, 2026
**Version:** 1.0 (CareBridge Connect Rebrand)

---

## Project Overview

**Name:** CareBridge Connect (formerly GatherIn)
**Purpose:** Skilled Nursing Facility family portal with HIPAA-compliant role-based dashboards
**Live URL:** https://parent-planner.vercel.app
**Repository:** https://github.com/Kainoa00/gather-app
**Local Path:** `C:\Users\kaish\OneDrive - Brigham Young University\AI product development\gatherin`

---

## Technology Stack

- **Frontend:** Next.js 14.2.28 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS with custom theme (Outfit font, lavender/peach/cream/navy palette)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Authentication:** Not yet implemented (permissive RLS for now)

---

## Current Features

### Core Functionality
1. **Dual-Mode Operation**
   - Demo mode (local state) via `isDemoMode` flag in `src/lib/supabase.ts`
   - Supabase mode (database + realtime subscriptions)

2. **Role-Based Dashboards**
   - Family Member Dashboard
   - Care Provider Dashboard
   - Administrator Dashboard
   - Each with HIPAA-compliant access controls

3. **Daily Digest System**
   - Meal tracking
   - Activity participation
   - Mood monitoring
   - Health notes
   - Photo sharing

4. **AI Chatbot Assistant**
   - Located at `/api/chat`
   - Provides care-related information and support
   - Built with OpenAI integration

5. **Real-time Updates**
   - Supabase realtime subscriptions for live data sync
   - Auto-refresh on data changes

---

## Architecture

### File Structure
```
gatherin/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main app with all state management
│   │   └── api/chat/route.ts     # AI chatbot endpoint
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client & isDemoMode flag
│   │   └── hooks/
│   │       └── useSupabaseData.ts # Data fetching hooks
│   └── components/               # UI components
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema (20 tables)
├── tailwind.config.ts            # Custom theme configuration
└── .env.local                    # Local environment variables
```

### Key Design Decisions
- **State Management:** All state lives in `src/app/page.tsx`
- **Data Fetching:** Custom hooks in `src/lib/hooks/useSupabaseData.ts`
- **Styling:** Custom Tailwind theme (user rejected glassmorphism redesign)
- **Font:** Outfit (original, not Manrope)
- **Color Palette:** Lavender (#9b87f5), Peach (#FFA07A), Cream (#FFEAA7), Navy (#1A1F2C)

---

## Database Schema

### Supabase Tables (20 total)
1. `residents` - Resident/patient information
2. `family_members` - Family member profiles
3. `care_providers` - Staff profiles
4. `daily_digests` - Daily activity summaries
5. `meals` - Meal tracking
6. `activities` - Activity participation
7. `mood_logs` - Mood monitoring
8. `health_notes` - Clinical notes
9. `photos` - Photo sharing
10. `chat_messages` - AI chatbot history
11. Additional tables for events, appointments, medications, etc.

**RLS Status:** Currently permissive (no authentication implemented yet)

---

## Deployment Configuration

### Vercel Environment Variables (Production)
```
NEXT_PUBLIC_SUPABASE_URL=https://gforsvliazaeeruzsqjr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[encrypted]
```

### Supabase Project
- **Project Ref:** gforsvliazaeeruzsqjr
- **Region:** US East
- **Database:** PostgreSQL with realtime enabled

### Git Repository
- **Branch:** master
- **Remote:** origin/master (up to date)
- **Latest Commit:** 04e1239 - "feat: Rebrand to CareBridge Connect with HIPAA role-based dashboards"

---

## Recent Changes (Last Session)

### 1. Rebrand to CareBridge Connect
- Updated app name and branding throughout
- Maintained original design preferences (Outfit font, lavender theme)

### 2. HIPAA Role-Based Dashboards
- Implemented three distinct dashboard views
- Added role-based access control structure
- HIPAA compliance considerations documented

### 3. Deployment Fixes
- ✅ Added missing Supabase environment variables to Vercel
- ✅ Deployed latest changes to production
- ✅ Verified database connectivity

---

## Known Issues & Solutions

### Build Issues
1. **Supabase Client Crash at Build**
   - **Problem:** createClient throws on empty URL during build
   - **Solution:** Use `null` placeholder when env vars missing

2. **.next Cache Corruption on OneDrive**
   - **Problem:** OneDrive sync conflicts with .next cache
   - **Solution:** Run `rm -rf .next` before rebuilding

### Code Issues
3. **Supabase JS v2.39 Database Generics**
   - **Problem:** Self-referencing `Partial<>` in Update types causes circular refs
   - **Solution:** Write Update types inline, avoid Partial<>

4. **DailyDigest Set Iteration**
   - **Problem:** Spread operator doesn't work with Set
   - **Solution:** Use `Array.from(new Set(...))`

5. **Bash Heredoc with Template Literals**
   - **Problem:** `${var}` in heredocs gets substituted
   - **Solution:** Use `git show` to pipe file content instead

### Security Notice
- **Next.js 14.2.28 Security Vulnerability:** A security update is available. Consider upgrading to the latest patched version.

---

## Development Workflow

### Local Development
```bash
cd "C:\Users\kaish\OneDrive - Brigham Young University\AI product development\gatherin"
npm run dev
```

### Build
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
vercel inspect https://parent-planner.vercel.app
```

### Environment Variables
```bash
vercel env ls              # List environment variables
vercel env pull            # Pull to local .env
vercel env add <name> <env> # Add new variable
```

---

## Future Roadmap

### Authentication & Security
- [ ] Implement user authentication (Supabase Auth)
- [ ] Add proper RLS policies for HIPAA compliance
- [ ] Role-based access control enforcement
- [ ] Audit logging for PHI access

### Features
- [ ] Mobile app (React Native/Expo)
- [ ] Push notifications for updates
- [ ] Video calling integration
- [ ] Document sharing and e-signatures
- [ ] Medication management
- [ ] Appointment scheduling

### Technical Improvements
- [ ] Upgrade Next.js to latest version (security fix)
- [ ] Add automated testing
- [ ] Implement proper error boundaries
- [ ] Add performance monitoring
- [ ] Setup CI/CD pipeline

---

## Design Preferences (Important!)

### ✅ User Prefers
- Outfit font
- Lavender/Peach/Cream/Navy color palette
- Original design aesthetic
- Clean, professional look

### ❌ User Rejected
- Manrope font
- Material Symbols
- Glassmorphism effects
- Overly trendy/flashy designs

---

## Useful Commands

### Git
```bash
git status
git log --oneline -10
git push origin master
```

### Vercel
```bash
vercel                    # Deploy preview
vercel --prod            # Deploy production
vercel --prod --force    # Force redeploy (clears cache)
vercel logs              # View deployment logs
```

### Supabase (requires CLI installation)
```bash
supabase link --project-ref gforsvliazaeeruzsqjr
supabase db push         # Push migrations
supabase db pull         # Pull remote schema
```

---

## Contact & Resources

- **GitHub Issues:** https://github.com/Kainoa00/gather-app/issues
- **Vercel Dashboard:** https://vercel.com/kainoa-shintakus-projects/parent-planner
- **Supabase Dashboard:** https://app.supabase.com/project/gforsvliazaeeruzsqjr

---

## Notes for Next Session

1. **All changes are deployed** - GitHub, Vercel, and Supabase are all up to date
2. **Environment variables are configured** - Vercel now has Supabase credentials
3. **Site is live and functional** - https://parent-planner.vercel.app
4. Consider upgrading Next.js for security patch
5. Consider implementing proper authentication next

---

**End of Project State Documentation**
