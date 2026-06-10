// 인수인계 태스크 관리 MVP 도메인 타입

// 난이도(중요도): 쉬움/보통/어려움
export type Importance = "easy" | "normal" | "hard";

// 인계자 계정 (어드민이 사전 발급, MVP에서는 seed)
export interface Handover {
  email: string;
  code: string;
  name: string;
  dept: string;
}

// 인수인계 프로젝트
export interface Project {
  id: string;
  name: string;
  dept: string;
  ownerEmail: string;
  createdAt: number;
}

// 첨부 파일 메타 (실제 업로드 대신 메타만 보관)
export interface Attachment {
  id: string;
  name: string;
  size: number; // bytes
  kind: "doc" | "image" | "video" | "etc";
}

// 인수자 (인수인계를 받는 사람)
export interface Member {
  id: string;
  projectId: string;
  name: string;
  email: string;
  rank: string; // 직급
  dept: string; // 소속 부서
  manager: string; // 인계 담당자
  note: string; // 비고
  createdAt: number;
  completedTaskIds: string[]; // 완수한 태스크 id (진행도 계산용)
}

// 인수자 질문 (챕터/주차별)
export interface Question {
  id: string;
  projectId: string;
  week: number;
  askerName: string;
  title: string;
  content: string;
  createdAt: number;
}

// 주차별 태스크
export interface Task {
  id: string;
  projectId: string;
  week: number; // 1~4 (챕터)
  importance: Importance;
  title: string;
  content: string;
  attachments: Attachment[];
  order: number; // 같은 주차 내 정렬 순서
  createdAt: number;
}

export const IMPORTANCE_META: Record<
  Importance,
  { label: string; dot: string; chip: string }
> = {
  easy: { label: "쉬움", dot: "bg-easy", chip: "bg-easy/10 text-easy" },
  normal: { label: "보통", dot: "bg-normal", chip: "bg-normal/10 text-normal" },
  hard: { label: "어려움", dot: "bg-hard", chip: "bg-hard/10 text-hard" },
};

export const WEEKS = [1, 2, 3, 4] as const;

export const weekLabel = (w: number) => `${w}챕터 (${w}주차)`;
