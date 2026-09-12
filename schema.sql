-- RUNS: one row per CSV upload
create table runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  filename text not null,
  total_suppliers int,
  total_emissions numeric,
  status text not null default 'processing' check (status in ('processing','done','failed')),
  executive_summary text,
  recommended_actions text
);

-- SUPPLIERS: raw input + calculated output in one row (1:1, no reason to split)
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,

  -- raw input
  supplier_name text not null,
  tier text not null check (tier in ('Tier 1','Tier 2','Tier 3')),
  region text,
  energy_kwh numeric check (energy_kwh >= 0),
  energy_kwh_estimated boolean not null default false,
  transport_km numeric check (transport_km >= 0),
  transport_km_estimated boolean not null default false,
  transport_mode text check (transport_mode in ('Road','Rail','Sea','Air')),
  material_type text not null,
  material_qty numeric check (material_qty >= 0),

  -- calculated output
  energy_emissions numeric,
  transport_emissions numeric,
  material_emissions numeric,
  total_emissions numeric,
  is_anomaly boolean not null default false,
  risk_score numeric,
  risk_reason text,
  risk_justification text,
  anomaly_reason text
);

-- RECOMMENDATIONS: suggested lower-emission swap for a given supplier
create table recommendations (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  recommended_supplier_id uuid not null references suppliers(id) on delete cascade,
  similarity_score numeric not null check (similarity_score between 0 and 1),
  emissions_reduction_pct numeric
);

-- Indexes for the lookups the dashboard actually does
create index idx_suppliers_run_id on suppliers(run_id);
create index idx_suppliers_total_emissions on suppliers(total_emissions desc);
create index idx_recommendations_supplier_id on recommendations(supplier_id);

-- COMPANY SETTINGS: Profile for the SaaS
create table company_settings (
  id text primary key default 'default',
  company_name text not null default 'Acme Corp',
  industry text not null default 'Manufacturing',
  target_reduction_pct numeric not null default 0,
  baseline_year int not null default 2023,
  currency text not null default 'USD',
  default_region text not null default 'Global'
);

-- APPLIED RECOMMENDATIONS: Audit log for user decisions
create table applied_recommendations (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  recommended_supplier_id uuid not null references suppliers(id) on delete cascade,
  applied_at timestamptz not null default now()
);
