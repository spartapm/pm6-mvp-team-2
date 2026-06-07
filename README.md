# 인수인계 태스크 관리 (MVP)

인계자가 인수인계 프로젝트 안에서 **주차별 태스크를 추가·수정·삭제**하고, 각 태스크에 설명과 참고 자료를 등록하는 MVP입니다.

## 핵심 가설

> 인계자가 인수인계 내용을 태스크 단위로 구조화하면 반복 설명과 누락을 줄일 수 있다.

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- **Supabase** (Postgres) — 데이터 영속화
- 인증: 자체 이메일+코드 로그인 (`handovers` 테이블)

## 설정 & 실행

### 1) 환경 변수

`.env.local` 에 Supabase 정보가 들어 있습니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
```

### 2) DB 스키마 생성 (최초 1회)

Supabase 대시보드 → **SQL Editor** 에서 [`supabase/schema.sql`](./supabase/schema.sql) 전체를 붙여넣고 실행하세요.
테이블·RLS 정책·시드 데이터(테스트 계정/데모 프로젝트)가 한 번에 생성됩니다.

> ⚠️ 데모 편의를 위해 RLS는 anon 전체 허용으로 설정돼 있습니다. 운영 전환 시 Supabase Auth + 사용자 기반 정책으로 반드시 교체하세요.

### 3) 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속.

## 테스트 계정 (seed)

| 이메일 | 코드 | 비고 |
| --- | --- | --- |
| `ABCD1234@naver.com` | `UXPMP0123` | 프로젝트 1개 보유 → 바로 태스크 화면 |
| `newbie@spartapm.com` | `NEW0001` | 프로젝트 없음 → 프로젝트 생성 화면 |

## 유저 플로우

```
로그인(이메일+코드)
   ├─ 프로젝트 없음   → 프로젝트 생성 → 태스크 관리
   └─ 프로젝트 1개+   → 태스크 관리
```

## 화면 (MVP 필수)

1. **로그인** (`/`) — 이메일+코드 검증, 프로젝트 유무에 따른 분기
2. **프로젝트 생성** (`/project/new`) — 프로젝트명·부서/팀명, 중복 검증
3. **태스크 관리** (`/project/[id]/tasks`) — 1~4주차 아코디언, 태스크 추가/수정/삭제, 중요도 색상, 첨부 파일

대시보드 · 인수자 질문 관리 · 인수자 관리는 후순위로 네비에 `준비중` 표기.

## 데이터 초기화

Supabase SQL Editor 에서 테이블 데이터를 지우거나 `supabase/schema.sql` 을 다시 실행하면 됩니다.
(시드 insert 는 `on conflict do nothing` 이라 중복 실행해도 안전합니다.)
