# Esküvőre Készülök

Esküvői szolgáltatókat hirdető platform – Next.js 16 + Supabase + Tailwind CSS v4.

## Telepítés

```bash
npm install
```

## Konfiguráció

1. Másold le az `.env.local.example` fájlt:

```bash
cp .env.local.example .env.local
```

2. Töltsd ki a Supabase adatokat a `.env.local` fájlban:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

## Supabase beállítása

1. Hozz létre egy projektet a [Supabase](https://supabase.com) oldalon
2. A **SQL Editor**-ban futtasd le a `supabase/schema.sql` tartalmát
3. A **Authentication > URL Configuration** menüben add hozzá:
   - Site URL: `http://localhost:3000` (dev) / `https://yourdomain.vercel.app` (prod)
   - Redirect URL: `http://localhost:3000/auth/callback`

## Admin beállítása

Egy felhasználó admin jogot csak adatbázisból kap:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@pelda.hu';
```

## Fejlesztői szerver indítása

```bash
npm run dev
```

Nyisd meg: [http://localhost:3000](http://localhost:3000)

## Deploy – Vercel

1. Hozd létre a projektet a [Vercel](https://vercel.com) oldalon (GitHub repóból)
2. Add hozzá a környezeti változókat a Vercel dashboardon:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. A Supabase-ben add hozzá a Vercel domaint az engedélyezett URL-ekhez

## Technológiai stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **UI:** Radix UI + shadcn-stílusú komponensek
- **Ikonok:** lucide-react
- **Backend/DB:** Supabase (Postgres, Auth, Storage)
- **Font:** Playfair Display (headings) + Inter (body)
- **Deploy:** Vercel

## Projektstruktúra

```
src/
  app/
    page.tsx              # Főoldal
    services/
      page.tsx            # Összes kategória
      [category]/page.tsx # Kategória-specifikus oldal + megye szűrő
    auth/
      login/page.tsx
      register/page.tsx
      callback/route.ts
    dashboard/
      page.tsx            # Szolgáltató dashboard
      profile/page.tsx    # Profil szerkesztése
    admin/
      page.tsx            # Admin jóváhagyó felület
    contact/page.tsx
  components/
    ui/                   # Alap UI komponensek
    layout/               # Navbar, Footer
    providers/            # ProviderCard, CountyFilter
  lib/
    supabase/             # Client + Server Supabase kliens
    types.ts              # TypeScript típusok + konstansok
    utils.ts
  middleware.ts           # Auth route protection
supabase/
  schema.sql              # Teljes adatbázis séma
```
