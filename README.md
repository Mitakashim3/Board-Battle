# Board Battle 🎮⚔️

A gamified, mobile-first Board Exam Reviewer for Filipino professionals preparing for LET, Nursing, and Criminology board exams. Features real-time 1v1 battles and engaging swipe-based solo review.

## 🚀 Features

- **Solo Review Mode**: Tinder-style swipeable question cards with instant feedback
- **1v1 Battle Mode**: Real-time battles with MMR-based matchmaking
- **Gamification**: Streaks, coins, energy system, and leaderboards
- **Mobile-First**: Optimized for thumb-zone interaction
- **Secure**: OWASP-compliant with server-side answer verification

## 🛡️ Security Features (CIA Triad)

### Confidentiality
- Role-Based Access Control (RBAC): `student` and `admin` roles
- Row Level Security (RLS) policies on all tables
- Students cannot see `correct_answer` column

### Integrity
- **Anti-Cheat**: Answers verified via server-side RPC function
- All inputs validated with Zod schemas
- No correct answers sent to frontend

### Availability
- Optimistic UI updates with rollback
- Aggressive caching for static assets
- Free tier optimized (Vercel + Supabase)

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup routes
│   ├── (app)/            # Protected app routes
│   │   ├── dashboard/
│   │   ├── reviewer/
│   │   ├── battle/
│   │   └── profile/
│   ├── (admin)/          # Admin routes
│   │   └── admin/
│   │       ├── questions/
│   │       └── subjects/
│   └── api/              # API routes
│       ├── game/
│       ├── battle/
│       └── admin/
├── components/
│   ├── game/             # Game components
│   │   ├── SwipeableCard.tsx
│   │   ├── BattleArena.tsx
│   │   └── ProgressBar.tsx
│   └── ui/               # UI components
├── stores/               # Zustand stores
│   ├── user-store.ts
│   ├── game-store.ts
│   ├── battle-store.ts
│   └── audio-store.ts
├── lib/
│   ├── supabase/         # Supabase client
│   ├── database.types.ts
│   ├── validations.ts    # Zod schemas
│   └── utils.ts
└── middleware.ts         # Route protection
```

## 🔧 Tech Stack

- **Frontend**: Next.js 14+ (App Router, TypeScript)
- **State**: Zustand
- **UI**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Real-time**: Supabase Realtime
- **Validation**: Zod
- **Data Fetching**: TanStack Query

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/board-battle.git
cd board-battle
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Run database migrations in Supabase:
   - Go to SQL Editor in Supabase Dashboard
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_rpc_functions.sql`

6. Start the development server:
```bash
npm run dev
```

## 📊 Database Schema

### Tables
- `users`: User profiles with MMR, coins, energy
- `subjects`: Exam subjects (LET, Nursing, Criminology)
- `questions`: Questions with options (correct answer hidden via RLS)
- `battles`: 1v1 battle sessions
- `user_progress`: Per-subject progress tracking
- `battle_answers`: Battle answer history

### Key RPC Functions
- `submit_answer`: Server-side answer verification (anti-cheat)
- `submit_battle_answer`: Battle answer verification
- `find_or_create_battle`: MMR-based matchmaking
- `regenerate_energy`: Energy regeneration system

## 🎮 Game Mechanics

### Solo Review
1. Select a subject
2. Swipe right for True/Option A, left for False/Option B
3. Earn coins based on difficulty and streaks
4. Break modal appears every 10 questions

### Battle Mode
1. Select a subject (costs 1 energy)
2. Matched with similar MMR player (±200)
3. 5 rounds, 15 seconds per question
4. Winner gains MMR and coins

### Energy System
- Max 5 energy
- Regenerates 1 energy every 30 minutes
- 1 energy per battle

## 🔒 Security Notes

- Never expose `correct_option_id` to frontend
- All answer verification happens in `submit_answer` RPC
- Middleware protects routes based on user role
- Admin routes return 404 for non-admins (security through obscurity)

## 📱 Mobile Optimization

- Thumb-zone optimized bottom navigation
- Touch-friendly swipe gestures
- Haptic feedback support
- Safe area handling for notched devices

## 📄 License

MIT License - feel free to use for educational purposes.

---

Made with ❤️ in the Philippines 🇵🇭
