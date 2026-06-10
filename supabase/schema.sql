-- =====================================================================
-- 인수인계 태스크 관리 MVP - Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- (여러 번 실행해도 안전하도록 idempotent 하게 작성)
-- =====================================================================

-- ---------- 테이블 ----------

-- 인계자 계정 (어드민이 사전 발급 → MVP에서는 seed)
create table if not exists public.handovers (
  email text primary key,
  code  text not null,
  name  text not null,
  dept  text not null
);

-- 인수인계 프로젝트
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  dept        text not null,
  owner_email text not null,
  created_at  timestamptz not null default now()
);

-- 주차별 태스크
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  week        int  not null,
  importance  text not null default 'normal',  -- easy | normal | hard
  title       text not null,
  content     text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  order_index int  not null default 0,
  created_at  timestamptz not null default now()
);

-- 인수자
create table if not exists public.members (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.projects(id) on delete cascade,
  name               text not null default '',
  email              text not null default '',
  rank               text not null default '',
  dept               text not null default '',
  manager            text not null default '',
  note               text not null default '',
  completed_task_ids jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now()
);

-- 인수자 질문
create table if not exists public.questions (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  week       int  not null,
  asker_name text not null default '인수자 사용자',
  title      text not null,
  content    text not null default '',
  created_at timestamptz not null default now()
);

alter table public.questions
  add column if not exists asker_name text not null default '인수자 사용자';

create index if not exists idx_projects_owner on public.projects(owner_email);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_members_project on public.members(project_id);
create index if not exists idx_questions_project on public.questions(project_id);

-- ---------- RLS 정책 ----------
-- 이 MVP는 Supabase Auth 대신 자체 이메일+코드 로그인을 사용하고
-- publishable(anon) 키로 접근하므로, 데모 목적상 anon 전체 허용 정책을 둡니다.
-- (운영 전환 시 반드시 Supabase Auth + 사용자 기반 정책으로 교체하세요.)

alter table public.handovers enable row level security;
alter table public.projects  enable row level security;
alter table public.tasks     enable row level security;
alter table public.members   enable row level security;
alter table public.questions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['handovers','projects','tasks','members','questions']
  loop
    execute format('drop policy if exists "public_all" on public.%I;', t);
    execute format(
      'create policy "public_all" on public.%I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ---------- 시드 데이터 ----------

-- 인계자 계정
insert into public.handovers (email, code, name, dept) values
  ('ABCD1234@naver.com', 'UXPMP0123', '김인계', '영업팀'),
  ('newbie@spartapm.com', 'NEW0001', '이신입', '마케팅팀')
on conflict (email) do nothing;

-- 데모 프로젝트 (고정 uuid)
insert into public.projects (id, name, dept, owner_email, created_at) values
  ('11111111-1111-1111-1111-111111111111', '신입 인수인계', '영업팀',
   'ABCD1234@naver.com', now() - interval '3 days')
on conflict (id) do nothing;

-- 데모 태스크 (고정 uuid로 진행도 계산과 연결)
insert into public.tasks (id, project_id, week, importance, title, content, order_index, created_at) values
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 1, 'hard',
   '핵심 업무 프로세스 실습',
   E'실제 업무 흐름에 따라 주요 프로세스를 직접 실습합니다.\n시스템 접속 → 데이터 입력 → 결재 요청 순서로 진행하며, 모르는 부분은 인계자에게 즉시 질문하세요.',
   0, now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 2, 'hard',
   'CRM 시스템 학습', '고객 관리 시스템의 주요 메뉴와 데이터 입력 규칙을 익힙니다.', 0, now() - interval '1 days'),
  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 2, 'normal',
   '자주 쓰는 자료 위치 확인', '공용 드라이브와 템플릿 폴더 구조를 확인합니다.', 1, now() - interval '20 hours'),
  ('a0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 2, 'hard',
   '주간 보고 작성', '주간 보고 템플릿을 사용해 한 주의 업무를 정리합니다.', 2, now() - interval '18 hours'),
  ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 2, 'normal',
   '2주차 체크포인트', '2주차에 익힌 내용을 인계자와 함께 점검합니다.', 3, now() - interval '16 hours')
on conflict (id) do nothing;

-- 데모 인수자 (completed_task_ids 로 진행도 표현)
insert into public.members (id, project_id, name, email, rank, dept, manager, note, completed_task_ids, created_at) values
  ('b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '박인수', 'soohan@gmail.com', '사원', '영업1팀', '김인계', '팀장님 추천',
   '["a0000000-0000-0000-0000-000000000001","a0000000-0000-0000-0000-000000000002"]'::jsonb,
   now() - interval '2 days'),
  ('b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '최신입', 'newone@gmail.com', '사원', '영업1팀', '김인계', '',
   '["a0000000-0000-0000-0000-000000000001"]'::jsonb,
   now() - interval '1 days')
on conflict (id) do nothing;

-- 데모 질문
insert into public.questions (id, project_id, week, asker_name, title, content, created_at) values
  ('c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 1,
   '박인수',
   '그룹웨어 로그인이 계속 실패합니다. 어떻게 해야 하나요?',
   'IT팀 내선 2000으로 문의하시면 됩니다. 임시 비밀번호는 사번 + 생년월일 6자리입니다.',
   now() - interval '10 hours'),
  ('c0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 2,
   '최신입',
   '점심시간이 정확히 언제인가요? 유연하게 사용 가능한가요?',
   '12:00~13:00이 기본이며, 팀 일정에 맞춰 30분 단위로 조정 가능합니다.',
   now() - interval '8 hours'),
  ('c0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 1,
   '박인수',
   '그룹웨어 접속 권한은 어디서 받나요?',
   '입사 당일 IT팀이 일괄 부여합니다. 미반영 시 IT팀 내선 2000으로 요청해주세요.',
   now() - interval '6 hours'),
  ('c0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 2,
   '최신입',
   '주간보고는 언제까지 올리면 되나요?',
   '매주 금요일 17:00까지 팀 공유 드라이브 주간보고 폴더에 업로드하면 됩니다.',
   now() - interval '4 hours'),
  ('c0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 2,
   '박인수',
   '고객 응대 템플릿은 어디에 있나요?',
   '공용 드라이브 > 영업팀 > 템플릿 > 고객응대_표준양식에서 확인 가능합니다.',
   now() - interval '2 hours')
on conflict (id) do nothing;
