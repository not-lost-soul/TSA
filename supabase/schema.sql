-- The Solution Academy schema. Run in Supabase SQL Editor as project owner.
create extension if not exists pgcrypto;
create table if not exists public.academy_classes (
 id uuid primary key default gen_random_uuid(), grade int not null unique check(grade between 6 and 10), title text not null default '', description text not null default '',
 pricing_model text not null default 'bundled' check(pricing_model in ('bundled','per_subject')), bundled_fee numeric(12,2) check(bundled_fee is null or bundled_fee>=0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(pricing_model <> 'per_subject' or bundled_fee is null)
);
create table if not exists public.subjects (
 id uuid primary key default gen_random_uuid(), class_id uuid not null references public.academy_classes(id) on delete cascade, name text not null, description text not null default '', fee numeric(12,2) check(fee is null or fee>=0), sort_order int not null default 0, created_at timestamptz not null default now(), unique(class_id,name)
);
create table if not exists public.exam_courses (
 id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, description text not null default '', fee numeric(12,2) check(fee is null or fee>=0), duration_label text not null default 'One day', exams text[] not null default array['JEE','NEET','CET','CUET','UPSC'], cta_label text not null default 'Make an inquiry', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.chat_conversations (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references auth.users(id) on delete cascade, student_email text, title text not null default 'Study session', last_message_preview text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.chat_messages (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.chat_conversations(id) on delete cascade, student_id uuid not null references auth.users(id) on delete cascade, role text not null check(role in ('user','assistant')), content text not null, created_at timestamptz not null default now()
);
create table if not exists public.helpbox_refusals (
 id uuid primary key default gen_random_uuid(), student_id uuid references auth.users(id) on delete set null, conversation_id uuid references public.chat_conversations(id) on delete set null, prompt text not null, refusal_reason text not null, created_at timestamptz not null default now()
);
create table if not exists public.activity_logs (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), identity text not null default 'unknown', ip_address text not null default 'unknown', user_agent text not null default 'unknown', success boolean not null, action text not null, details jsonb not null default '{}'::jsonb
);
create table if not exists public.student_sessions (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references auth.users(id) on delete cascade, conversation_id uuid references public.chat_conversations(id) on delete cascade, created_at timestamptz not null default now(), ip_address text not null default 'unknown', user_agent text not null default 'unknown', city text not null default 'unknown', region text not null default 'unknown', country text not null default 'unknown', location_status text not null default 'unknown' check(location_status in ('resolved','unknown'))
);
create table if not exists public.inquiries (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), name text not null, phone text not null, email text, message text, course text not null, ip_address text not null default 'unknown'
);
create index if not exists chat_conversations_student_idx on public.chat_conversations(student_id,updated_at desc);
create index if not exists chat_messages_conversation_idx on public.chat_messages(conversation_id,created_at);
create index if not exists student_sessions_conversation_idx on public.student_sessions(conversation_id,created_at desc);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);
-- RLS is enabled everywhere. Public pages use server-only service role to read published content;
-- never expose service-role credentials to browsers.
alter table public.academy_classes enable row level security; alter table public.subjects enable row level security; alter table public.exam_courses enable row level security;
alter table public.chat_conversations enable row level security; alter table public.chat_messages enable row level security; alter table public.helpbox_refusals enable row level security;
alter table public.activity_logs enable row level security; alter table public.student_sessions enable row level security; alter table public.inquiries enable row level security;
-- No direct client policies for privileged content, audit logs, sessions, inquiries, or refusals.
-- Students may read/write only their own conversation/message rows if later using direct client access.
create policy "students read own conversations" on public.chat_conversations for select to authenticated using (auth.uid()=student_id);
create policy "students read own messages" on public.chat_messages for select to authenticated using (auth.uid()=student_id);
-- All writes in this implementation go through authenticated server routes with the service role.
-- The service role bypasses RLS and must remain server-only.
