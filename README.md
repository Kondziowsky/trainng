# Trainng

A cross-platform training planner (Android · iOS · Web) built with Expo, React Native,
TypeScript and Supabase.

The MVP answers one question well: **“what training do I have today?”**

---

## 1. Architecture

| Concern | Choice | Why |
| --- | --- | --- |
| App runtime | **Expo SDK 57 / React Native 0.86** | One codebase for Android, iOS and Web; EAS handles store builds later without re-platforming. |
| Language | **TypeScript, `strict: true`** | No `any` in application code. |
| Navigation | **Expo Router (file-based)** | Routes are files, deep links and web URLs come for free, and `Stack.Protected` gives a declarative auth gate instead of imperative redirects. |
| Server state | **TanStack Query** | Caching, background refetch, loading/error states and cache invalidation — the things a workout planner actually needs. No Redux. |
| Client state | **React `useState`** | Nothing in the MVP is global. Zustand can be added later if that changes; adding it now would be speculative. |
| Backend | **Supabase (Postgres + Auth + RLS)** | Managed Postgres with row-level authorization. No custom backend to run or deploy. |
| Styling | **`StyleSheet` + a semantic token system** | Zero runtime styling dependency, works identically on all three platforms, and makes light/dark/future skins a data change. |
| Dates | **`Intl` + ~100 lines in `src/lib/date.ts`** | The MVP needs a month grid and two format calls. A date library would not earn its place. |

### Deliberate non-dependencies

`react-native-reanimated`, `react-native-gesture-handler`, a calendar library, a date
library and a native date-picker were all considered and left out — nothing in the MVP
needs them. Each is one `npx expo install` away when a feature actually requires it.

---

## 2. Folder structure

```
src/
  app/                     # Expo Router routes only — thin, no business logic
    _layout.tsx            #   providers + auth gate
    sign-in.tsx
    settings.tsx
    (tabs)/                #   Today · Calendar · Exercises
    exercises/             #   new.tsx, [id].tsx
    workouts/              #   new.tsx, [id].tsx
  components/ui/           # Design-system primitives (Text, Button, Card, Input, …)
  features/                # Domain slices — each owns its api + queries + components
    today/
    calendar/
    exercises/
    workouts/
  lib/
    auth/                  # Session provider
    query/                 # TanStack Query client
    supabase/              # Client, generated DB types, error mapping
    date.ts
  theme/                   # Tokens, skins, ThemeProvider, makeStyles
supabase/
  migrations/              # Committed SQL — the schema lives in Git
```

The rule that keeps this honest: **routes render, features decide, `lib` talks to the
outside world.** A screen never imports `supabase` directly.

---

## 3. Database schema

```
auth.users
   │
   ├─1:1─ profiles
   │
   ├─1:N─ exercises              (the personal library)
   │         ▲
   │         │ N:1  (reference, never a copy)
   │         │
   └─1:N─ workouts ─1:N─ workout_exercises
```

* **`exercises`** — one row per exercise per user. `unique (owner_id, lower(name))` so
  “Bench Press” exists exactly once and is *referenced* by every workout that uses it.
* **`workouts`** — carries `athlete_id` (who performs it) **and** `created_by` (who wrote
  it). They are identical today; splitting them now means the future trainer feature
  needs no data migration.
* **`workout_exercises`** — the join row plus the planned prescription (`order_index`,
  `sets`, `reps`, `notes`). `on delete restrict` on `exercise_id` stops a library entry
  that is still in use from being deleted out from under a plan.
* UUID primary keys, `created_at`/`updated_at` on every table (maintained by trigger).
* **RLS is enabled on all four tables.** `workout_exercises` derives its policies from
  the parent workout, so the access rule lives in one place. The client filters for
  convenience only — never for authorization.

---

## 4. Theme / design system

Three layers:

1. **`theme/tokens.ts`** — spacing, radii, typography, elevation. Skin-independent.
2. **`theme/skins/*.ts`** — a `Skin` is `{ id, label, colors: { light, dark } }`.
   Dark is a designed palette, not an inverted one.
3. **`theme/ThemeProvider.tsx`** — resolves `mode` (`light` | `dark` | `system`) and the
   active skin into one `Theme`, and persists the preference.

Components consume **semantic tokens only** (`background`, `surface`, `surfaceElevated`,
`text`, `textSecondary`, `primary`, `border`, `danger`, `success`, …), via:

```ts
const useStyles = makeStyles((t) => ({
  card: { backgroundColor: t.colors.surface, borderRadius: t.radius.lg },
}));
```

Adding “Midnight” or “Neon” later is: create `theme/skins/midnight.ts`, add it to the
registry in `theme/skins/index.ts`. Nothing in the UI changes. That is the hook a future
purchasable-skins model would use — no store, entitlements or payments exist today.

---

## 5. Setup

### 5.1 Create the Supabase project

1. Sign up at <https://supabase.com> and create a new project (the free tier is fine).
2. In **Project Settings → API**, copy:
   * **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   * **`anon` public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

   Both are safe in the client bundle — they are public and constrained by RLS.
   The **`service_role` key must never appear in this app**; it bypasses RLS.
3. In **Authentication → Providers**, keep *Email* enabled. For local testing you may
   want to turn **“Confirm email”** off so sign-up gives you a session immediately.

### 5.2 Apply the schema

Either paste `supabase/migrations/20260819120000_init.sql` into the Supabase
**SQL Editor** and run it, or use the CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 5.3 Configure and run

```bash
cp .env.example .env      # then fill in the two values
npm install
npm start                 # press "a" for Android, or scan the QR with Expo Go
```

Environment variables are read at bundle time — restart the dev server after editing
`.env`.

```bash
npm run typecheck         # tsc --noEmit
npm run lint
npm run web               # same app in a browser
```

---

## 6. MVP implementation plan

| # | Step | Status |
| --- | --- | --- |
| 1 | Expo + TypeScript + Expo Router foundation, lint/format config | ✅ |
| 2 | Theme system: tokens, skins, provider, light/dark, `makeStyles` | ✅ |
| 3 | Database schema + RLS migration | ✅ |
| 4 | Supabase client, auth session provider, TanStack Query, sign-in screen | ✅ |
| 5 | Shared UI primitives (Text, Button, Card, Input, Screen, state views) | ✅ |
| 6 | Bottom tabs + Today / Calendar / Exercises screens | ✅ |
| 7 | Exercise CRUD + search; workout CRUD with the reusable exercise picker | ✅ |
| 8 | Settings: light / dark / system, sign out | ✅ |

### Intentionally not built

Workout tracking (start/timer/history/PRs), notifications, trainer accounts, theme store
and payments, social login. The data model and theme registry leave room for each; none
of them are implemented.

Two smaller notes:

* Today's card shows `N exercises · M sets` rather than a duration — there is no
  `duration_minutes` column yet, since the spec's workout fields did not include one.
  It is a one-line migration if you want it.
* Creating a workout writes the parent row and its exercises in two statements with a
  compensating delete on failure, not a transaction. If that ever matters, move it into a
  Postgres function and call it with `supabase.rpc()` — the call site is one function in
  `features/workouts/api.ts`.

---

## 7. Deployment (later)

* **Android / iOS** — EAS Build (`eas build -p android`), then Google Play / App Store.
* **Web** — `npx expo export -p web` produces a static site for any static host.
* **Backend** — Supabase is already hosted; only the migrations need promoting.

Nothing in the app depends on a local-only backend.
