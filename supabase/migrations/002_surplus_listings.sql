-- ===========================================================================
-- Food Bridge — migration 002: surplus listings (phase 2)
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Requires 001 (supabase/schema.sql) to have been applied first.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Listing status
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_status') then
    create type public.listing_status as enum (
      'available', 'claimed', 'picked_up', 'cancelled'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Surplus listings — surplus published by a restaurant/hotel
--    The foreign keys are named explicitly so PostgREST can embed the
--    restaurant / claimer profile with a deterministic hint, e.g.
--    `profiles!surplus_listings_restaurant_id_fkey(...)`.
-- ---------------------------------------------------------------------------
create table if not exists public.surplus_listings (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null,
  food_type       text not null,
  quantity        text not null,
  expiry_at       timestamptz not null,
  pickup_address  text,
  status          public.listing_status not null default 'available',
  claimed_by      uuid,
  claimed_at      timestamptz,
  created_at      timestamptz not null default now(),
  constraint surplus_listings_restaurant_id_fkey
    foreign key (restaurant_id) references public.profiles (id) on delete cascade,
  constraint surplus_listings_claimed_by_fkey
    foreign key (claimed_by) references public.profiles (id) on delete set null
);

comment on table public.surplus_listings is
  'Surplus food published by a restaurant/hotel and claimed by a charity.';
comment on column public.surplus_listings.quantity is
  'Free text so kitchens can write "10 portions" or "2 crates".';

create index if not exists surplus_listings_status_expiry_idx
  on public.surplus_listings (status, expiry_at);
create index if not exists surplus_listings_restaurant_idx
  on public.surplus_listings (restaurant_id, created_at desc);
create index if not exists surplus_listings_claimed_by_idx
  on public.surplus_listings (claimed_by, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.surplus_listings enable row level security;

-- Read: a listing is visible when it is still available (public directory),
-- when it belongs to the requesting restaurant, or when the requester claimed it.
drop policy if exists "Listings are readable when available, owned or claimed"
  on public.surplus_listings;
create policy "Listings are readable when available, owned or claimed"
  on public.surplus_listings
  for select
  to anon, authenticated
  using (
    status = 'available'
    or restaurant_id = (select auth.uid())
    or claimed_by = (select auth.uid())
  );

-- Insert: only a restaurant, and only on its own behalf.
drop policy if exists "Restaurants can create their own listings"
  on public.surplus_listings;
create policy "Restaurants can create their own listings"
  on public.surplus_listings
  for insert
  to authenticated
  with check (
    restaurant_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'restaurant'
    )
  );

-- Update: only the owning restaurant (charities go through claim_listing()).
drop policy if exists "Restaurants can update their own listings"
  on public.surplus_listings;
create policy "Restaurants can update their own listings"
  on public.surplus_listings
  for update
  to authenticated
  using (restaurant_id = (select auth.uid()))
  with check (restaurant_id = (select auth.uid()));

-- Delete: only the owning restaurant.
drop policy if exists "Restaurants can delete their own listings"
  on public.surplus_listings;
create policy "Restaurants can delete their own listings"
  on public.surplus_listings
  for delete
  to authenticated
  using (restaurant_id = (select auth.uid()));

grant select on public.surplus_listings to anon;
grant select, insert, update, delete on public.surplus_listings to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Guard: a restaurant may only ever cancel its own listing
--    Stops an owner from faking a claim (claimed_by / claimed_at) or jumping
--    a listing straight to 'claimed'/'picked_up'.
--    Charities never match this branch — claim_listing() is theirs to use.
-- ---------------------------------------------------------------------------
create or replace function public.surplus_listings_guard_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) = old.restaurant_id then
    if new.restaurant_id is distinct from old.restaurant_id then
      raise exception 'A listing cannot be moved to another restaurant.'
        using errcode = 'P0001';
    end if;

    if new.claimed_by is distinct from old.claimed_by
       or new.claimed_at is distinct from old.claimed_at then
      raise exception 'Claims are only assigned by claim_listing().'
        using errcode = 'P0001';
    end if;

    if new.status is distinct from old.status
       and not (old.status = 'available' and new.status = 'cancelled') then
      raise exception 'Only an available listing can be cancelled.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists surplus_listings_guard_update_trigger
  on public.surplus_listings;
create trigger surplus_listings_guard_update_trigger
  before update on public.surplus_listings
  for each row
  execute function public.surplus_listings_guard_update();

-- ---------------------------------------------------------------------------
-- 5. claim_listing(listing_id uuid)
--    The only way a charity can claim. The status check lives in the WHERE
--    clause of a single UPDATE, so two charities racing for the same listing
--    cannot both win — the loser sees zero rows updated and gets an error.
-- ---------------------------------------------------------------------------
create or replace function public.claim_listing(listing_id uuid)
returns public.surplus_listings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_role    public.user_role;
  v_listing public.surplus_listings;
  v_exists  boolean;
begin
  if v_uid is null then
    raise exception 'You must be signed in to claim a listing.'
      using errcode = 'P0001';
  end if;

  select p.role into v_role
  from public.profiles p
  where p.id = v_uid;

  if v_role is null then
    raise exception 'No profile found for this account.'
      using errcode = 'P0001';
  end if;

  if v_role <> 'charity' then
    raise exception 'Only charity accounts can claim surplus listings.'
      using errcode = 'P0001';
  end if;

  update public.surplus_listings l
     set status = 'claimed',
         claimed_by = v_uid,
         claimed_at = now()
   where l.id = listing_id
     and l.status = 'available'
  returning * into v_listing;

  if v_listing.id is null then
    select exists (
      select 1 from public.surplus_listings l where l.id = listing_id
    ) into v_exists;

    if v_exists then
      raise exception 'This listing has already been claimed.'
        using errcode = 'P0001';
    end if;

    raise exception 'This listing no longer exists.'
      using errcode = 'P0002';
  end if;

  return v_listing;
end $$;

comment on function public.claim_listing(uuid) is
  'Atomically claims an available listing for the calling charity.';

-- Function is callable by signed-in users only.
revoke all on function public.claim_listing(uuid) from public;
revoke all on function public.claim_listing(uuid) from anon;
grant execute on function public.claim_listing(uuid) to authenticated;
