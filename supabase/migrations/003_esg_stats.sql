-- ===========================================================================
-- Food Bridge — migration 003: ESG impact stats (phase 3)
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Requires 001 (supabase/schema.sql) and
-- 002 (supabase/migrations/002_surplus_listings.sql) to have been applied.
--
-- This migration is additive: it adds one nullable column and one read-only
-- aggregate function. No existing table, policy or grant is modified.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Estimated weight on a listing
--    Nullable on purpose: listings published before this column existed (and
--    any listing whose kitchen did not give a figure) simply contribute
--    nothing to the impact totals instead of blocking the migration.
-- ---------------------------------------------------------------------------
alter table public.surplus_listings
  add column if not exists estimated_kg numeric;

comment on column public.surplus_listings.estimated_kg is
  'Restaurant-provided estimate of the food weight in kilograms (e.g. 12.5). Nullable — older rows have no figure and are excluded from the impact totals.';

-- ---------------------------------------------------------------------------
-- 2. get_platform_impact() — the public ESG totals
--
--    SECURITY DEFINER on purpose: the visitor loading /impact is `anon` and is
--    not allowed by RLS to read the thousands of rows behind these numbers,
--    but the aggregate itself is public. The function returns three scalars —
--    a sum and two counts — and can never leak a row or a column of one.
--
--    Owned by the role that runs this migration (postgres in the Supabase SQL
--    editor), which bypasses RLS on public.surplus_listings. If you ever move
--    the function to another owner, check it still bypasses RLS, otherwise it
--    will silently return zeros.
--
--    `set search_path = ''` forces every reference below to be schema
--    qualified, so nothing can be shadowed by a hostile search_path.
-- ---------------------------------------------------------------------------
create or replace function public.get_platform_impact()
returns table (
  total_kg         numeric,
  restaurant_count bigint,
  charity_count    bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    -- Food rescued: the summed estimate of every listing a charity has taken
    -- on (claimed) or collected (picked_up). coalesce keeps the result on one
    -- row with 0 instead of NULL on an empty database.
    coalesce(
      (
        select sum(l.estimated_kg)
        from public.surplus_listings l
        where l.status in ('claimed', 'picked_up')
      ),
      0
    )::numeric as total_kg,

    -- Kitchens taking part: restaurants with at least one listing, whatever
    -- its status (an available listing still counts as participating).
    (
      select count(*)
      from public.profiles p
      where p.role = 'restaurant'
        and exists (
          select 1
          from public.surplus_listings l
          where l.restaurant_id = p.id
        )
    )::bigint as restaurant_count,

    -- Charities served: charity accounts that have claimed at least one
    -- listing.
    (
      select count(*)
      from public.profiles p
      where p.role = 'charity'
        and exists (
          select 1
          from public.surplus_listings l
          where l.claimed_by = p.id
        )
    )::bigint as charity_count;
$$;

comment on function public.get_platform_impact() is
  'Platform-wide ESG totals: summed estimated_kg of claimed/picked_up listings, restaurants with at least one listing, charities that have claimed at least one listing. Aggregates only — intentionally callable by anon.';

-- Public by design: no sign-in is required to read the aggregate, and nothing
-- row-level can be derived from it.
revoke all on function public.get_platform_impact() from public;
grant execute on function public.get_platform_impact() to anon;
grant execute on function public.get_platform_impact() to authenticated;
