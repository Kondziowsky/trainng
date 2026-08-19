-- ===========================================================================
-- Trainng — initial schema
--
-- Design notes
--   * Every table is user-scoped and protected by RLS. The client never
--     filters by user id for authorization; it filters for convenience only.
--   * `exercises` is a per-user library. A `workout_exercises` row REFERENCES
--     an exercise — it never copies it. One "Bench Press" row can be used by
--     any number of workouts.
--   * `workouts` separates `athlete_id` (who performs it) from `created_by`
--     (who authored it). Today they are always the same user; this leaves the
--     door open for a trainer role later without a data migration.
-- ===========================================================================

create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Application-level user record. Mirrors auth.users 1:1 and is the place to hang user settings.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- exercises  (the reusable per-user library)
-- ---------------------------------------------------------------------------

create type public.muscle_group as enum (
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'glutes',
  'core',
  'full_body',
  'cardio',
  'mobility',
  'other'
);

create table public.exercises (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  name         text not null check (char_length(btrim(name)) between 1 and 80),
  description  text check (char_length(description) <= 1000),
  muscle_group public.muscle_group,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.exercises is
  'A user''s personal exercise library. Referenced by workout_exercises, never duplicated.';

-- One "Bench Press" per user, case-insensitively.
create unique index exercises_owner_name_key
  on public.exercises (owner_id, lower(btrim(name)));

-- Supports the library list and the "search then pick" flow in workout creation.
create index exercises_owner_created_at_idx
  on public.exercises (owner_id, created_at desc);

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workouts
-- ---------------------------------------------------------------------------

create table public.workouts (
  id            uuid primary key default gen_random_uuid(),
  athlete_id    uuid not null references auth.users (id) on delete cascade,
  created_by    uuid not null references auth.users (id) on delete cascade,
  scheduled_for date not null,
  name          text not null check (char_length(btrim(name)) between 1 and 80),
  description   text check (char_length(description) <= 1000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.workouts.athlete_id is 'The user who performs this workout.';
comment on column public.workouts.created_by is
  'The user who authored it. Equal to athlete_id today; a trainer later.';

-- Drives both the Today screen and the calendar month query.
create index workouts_athlete_scheduled_idx
  on public.workouts (athlete_id, scheduled_for);

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workout_exercises  (join row + planned prescription)
-- ---------------------------------------------------------------------------

create table public.workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  order_index smallint not null check (order_index >= 0),
  sets        smallint check (sets between 1 and 100),
  reps        smallint check (reps between 1 and 1000),
  notes       text check (char_length(notes) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.workout_exercises is
  'Ordered exercises planned inside a workout. on delete restrict on exercise_id prevents orphaning a plan by deleting a library entry that is still in use.';

create index workout_exercises_workout_idx
  on public.workout_exercises (workout_id, order_index);

create trigger workout_exercises_set_updated_at
  before update on public.workout_exercises
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles           enable row level security;
alter table public.exercises          enable row level security;
alter table public.workouts           enable row level security;
alter table public.workout_exercises  enable row level security;

-- profiles ------------------------------------------------------------------

create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- exercises -----------------------------------------------------------------

create policy "exercises: read own"
  on public.exercises for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "exercises: insert own"
  on public.exercises for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "exercises: update own"
  on public.exercises for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "exercises: delete own"
  on public.exercises for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- workouts ------------------------------------------------------------------
-- Readable by the athlete or the author; writable only by the author.

create policy "workouts: read as athlete or author"
  on public.workouts for select
  to authenticated
  using (athlete_id = (select auth.uid()) or created_by = (select auth.uid()));

create policy "workouts: insert as author"
  on public.workouts for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "workouts: update as author"
  on public.workouts for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy "workouts: delete as author"
  on public.workouts for delete
  to authenticated
  using (created_by = (select auth.uid()));

-- workout_exercises ---------------------------------------------------------
-- Access is derived from the parent workout so the rules stay in one place.

create policy "workout_exercises: read via workout"
  on public.workout_exercises for select
  to authenticated
  using (
    exists (
      select 1
      from public.workouts w
      where w.id = workout_exercises.workout_id
        and (w.athlete_id = (select auth.uid()) or w.created_by = (select auth.uid()))
    )
  );

create policy "workout_exercises: insert via workout"
  on public.workout_exercises for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.created_by = (select auth.uid())
    )
    and exists (
      select 1 from public.exercises e
      where e.id = workout_exercises.exercise_id and e.owner_id = (select auth.uid())
    )
  );

create policy "workout_exercises: update via workout"
  on public.workout_exercises for update
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.created_by = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.created_by = (select auth.uid())
    )
  );

create policy "workout_exercises: delete via workout"
  on public.workout_exercises for delete
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.created_by = (select auth.uid())
    )
  );
