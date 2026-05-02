create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  currency text not null default 'USD',
  sector text not null,
  size text not null,
  plan text not null default 'starter',
  billing_cycle text not null default 'monthly',
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric(14,2) not null,
  category text not null,
  subcategory text,
  account text not null,
  currency text not null,
  source text not null check (source in ('manual', 'csv_import', 'api')),
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type text not null check (type in ('bank', 'cash', 'credit', 'investment')),
  currency text not null,
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  period_start date not null,
  period_end date not null,
  content jsonb not null,
  ai_analysis text not null,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists forecasts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  period text not null,
  scenario text not null check (scenario in ('conservative', 'realistic', 'optimistic')),
  data jsonb not null,
  generated_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kpis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  period date not null,
  revenue numeric(14,2) not null,
  expenses numeric(14,2) not null,
  gross_margin numeric(10,6) not null,
  operating_margin numeric(10,6) not null,
  net_margin numeric(10,6) not null,
  cashflow numeric(14,2) not null,
  burn_rate numeric(14,2) not null,
  runway_months numeric(10,2) not null,
  arr numeric(14,2) not null,
  mrr numeric(14,2) not null,
  calculated_at timestamptz not null default now(),
  unique (organization_id, period)
);

create table if not exists benchmarks (
  id uuid primary key default gen_random_uuid(),
  sector text not null,
  country text not null,
  size text not null,
  metric text not null,
  value numeric(14,4) not null,
  percentile_25 numeric(14,4) not null,
  percentile_50 numeric(14,4) not null,
  percentile_75 numeric(14,4) not null,
  updated_at timestamptz not null default now(),
  unique (sector, country, size, metric)
);

create index if not exists idx_members_org_id on members (organization_id);
create index if not exists idx_members_user_id on members (user_id);

create index if not exists idx_transactions_org_id on transactions (organization_id);
create index if not exists idx_transactions_org_date on transactions (organization_id, date desc);
create index if not exists idx_accounts_org_id on accounts (organization_id);
create index if not exists idx_reports_org_id on reports (organization_id);
create index if not exists idx_alerts_org_id on alerts (organization_id);
create index if not exists idx_alerts_org_read on alerts (organization_id, is_read);
create index if not exists idx_forecasts_org_id on forecasts (organization_id);
create index if not exists idx_conversations_org_id on conversations (organization_id);
create index if not exists idx_kpis_org_period on kpis (organization_id, period desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_conversations_updated_at on conversations;
create trigger trigger_conversations_updated_at
before update on conversations
for each row execute procedure set_updated_at();

create or replace function is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from members
    where organization_id = org
      and user_id = auth.uid()
  );
$$;

create or replace function is_org_admin_or_owner(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from members
    where organization_id = org
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

alter table organizations enable row level security;
alter table members enable row level security;
alter table transactions enable row level security;
alter table accounts enable row level security;
alter table reports enable row level security;
alter table alerts enable row level security;
alter table forecasts enable row level security;
alter table conversations enable row level security;
alter table kpis enable row level security;
alter table benchmarks enable row level security;

create policy "organizations_select_by_member"
  on organizations
  for select
  using (is_org_member(id));

create policy "organizations_update_by_admin"
  on organizations
  for update
  using (is_org_admin_or_owner(id))
  with check (is_org_admin_or_owner(id));

create policy "members_select_by_member"
  on members
  for select
  using (is_org_member(organization_id));

create policy "members_insert_by_admin"
  on members
  for insert
  with check (is_org_admin_or_owner(organization_id));

create policy "members_update_by_admin"
  on members
  for update
  using (is_org_admin_or_owner(organization_id))
  with check (is_org_admin_or_owner(organization_id));

create policy "members_delete_by_admin"
  on members
  for delete
  using (is_org_admin_or_owner(organization_id));

create policy "transactions_select_by_member"
  on transactions
  for select
  using (is_org_member(organization_id));

create policy "transactions_insert_by_member"
  on transactions
  for insert
  with check (is_org_member(organization_id));

create policy "transactions_update_by_member"
  on transactions
  for update
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "transactions_delete_by_admin"
  on transactions
  for delete
  using (is_org_admin_or_owner(organization_id));

create policy "accounts_select_by_member"
  on accounts
  for select
  using (is_org_member(organization_id));

create policy "accounts_insert_by_member"
  on accounts
  for insert
  with check (is_org_member(organization_id));

create policy "accounts_update_by_member"
  on accounts
  for update
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "accounts_delete_by_admin"
  on accounts
  for delete
  using (is_org_admin_or_owner(organization_id));

create policy "reports_select_by_member"
  on reports
  for select
  using (is_org_member(organization_id));

create policy "reports_insert_by_member"
  on reports
  for insert
  with check (is_org_member(organization_id));

create policy "reports_update_by_member"
  on reports
  for update
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "alerts_select_by_member"
  on alerts
  for select
  using (is_org_member(organization_id));

create policy "alerts_insert_by_member"
  on alerts
  for insert
  with check (is_org_member(organization_id));

create policy "alerts_update_by_member"
  on alerts
  for update
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "forecasts_select_by_member"
  on forecasts
  for select
  using (is_org_member(organization_id));

create policy "forecasts_insert_by_member"
  on forecasts
  for insert
  with check (is_org_member(organization_id));

create policy "forecasts_update_by_member"
  on forecasts
  for update
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "conversations_select_by_member"
  on conversations
  for select
  using (is_org_member(organization_id));

create policy "conversations_insert_by_member"
  on conversations
  for insert
  with check (is_org_member(organization_id) and user_id = auth.uid());

create policy "conversations_update_by_member"
  on conversations
  for update
  using (is_org_member(organization_id) and user_id = auth.uid())
  with check (is_org_member(organization_id) and user_id = auth.uid());

create policy "kpis_select_by_member"
  on kpis
  for select
  using (is_org_member(organization_id));

create policy "kpis_insert_by_member"
  on kpis
  for insert
  with check (is_org_member(organization_id));

create policy "kpis_update_by_member"
  on kpis
  for update
  using (is_org_member(organization_id))
  with check (is_org_member(organization_id));

create policy "benchmarks_select_authenticated"
  on benchmarks
  for select
  using (auth.uid() is not null);
