"use client";

import { supabase } from "./supabase";
import type {
  Attachment,
  Handover,
  Importance,
  Member,
  Project,
  Question,
  Task,
} from "./types";

// =====================================================================
// Supabase 기반 데이터 스토어
// - 인증은 자체 이메일+코드 (handovers 테이블) 사용
// - 세션은 로그인한 인계자 이메일을 localStorage 에 보관
// =====================================================================

const SESSION_KEY = "pm6.session.email";
const isBrowser = () => typeof window !== "undefined";
const toMs = (iso: string | null) => (iso ? new Date(iso).getTime() : Date.now());

// ---------- row -> 도메인 매핑 ----------
type ProjectRow = {
  id: string;
  name: string;
  dept: string;
  owner_email: string;
  created_at: string;
};
const mapProject = (r: ProjectRow): Project => ({
  id: r.id,
  name: r.name,
  dept: r.dept,
  ownerEmail: r.owner_email,
  createdAt: toMs(r.created_at),
});

type TaskRow = {
  id: string;
  project_id: string;
  week: number;
  importance: string;
  title: string;
  content: string;
  attachments: Attachment[] | null;
  order_index: number;
  created_at: string;
};
const mapTask = (r: TaskRow): Task => ({
  id: r.id,
  projectId: r.project_id,
  week: r.week,
  importance: r.importance as Importance,
  title: r.title,
  content: r.content,
  attachments: r.attachments ?? [],
  order: r.order_index,
  createdAt: toMs(r.created_at),
});

type MemberRow = {
  id: string;
  project_id: string;
  name: string;
  email: string;
  rank: string;
  dept: string;
  manager: string;
  note: string;
  completed_task_ids: string[] | null;
  created_at: string;
};
const mapMember = (r: MemberRow): Member => ({
  id: r.id,
  projectId: r.project_id,
  name: r.name,
  email: r.email,
  rank: r.rank,
  dept: r.dept,
  manager: r.manager,
  note: r.note,
  completedTaskIds: r.completed_task_ids ?? [],
  createdAt: toMs(r.created_at),
});

type QuestionRow = {
  id: string;
  project_id: string;
  week: number;
  title: string;
  content: string;
  created_at: string;
};
const mapQuestion = (r: QuestionRow): Question => ({
  id: r.id,
  projectId: r.project_id,
  week: r.week,
  title: r.title,
  content: r.content,
  createdAt: toMs(r.created_at),
});

// ---------- 인증 / 세션 ----------
export async function login(
  email: string,
  code: string
): Promise<Handover | null> {
  const { data, error } = await supabase
    .from("handovers")
    .select("*")
    // QA 기준: 이메일/코드 모두 대소문자까지 정확히 일치해야 로그인 가능
    .eq("email", email.trim())
    .eq("code", code.trim())
    .maybeSingle();
  if (error || !data) return null;
  if (isBrowser()) window.localStorage.setItem(SESSION_KEY, data.email);
  return data as Handover;
}

export function logout() {
  if (isBrowser()) window.localStorage.removeItem(SESSION_KEY);
}

export function sessionEmail(): string | null {
  return isBrowser() ? window.localStorage.getItem(SESSION_KEY) : null;
}

export async function currentUser(): Promise<Handover | null> {
  const email = sessionEmail();
  if (!email) return null;
  const { data, error } = await supabase
    .from("handovers")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error || !data) return null;
  return data as Handover;
}

// ---------- 프로젝트 ----------
export async function getProjects(ownerEmail: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_email", ownerEmail)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as ProjectRow[]).map(mapProject);
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapProject(data as ProjectRow);
}

export type CreateProjectResult =
  | { ok: true; project: Project }
  | { ok: false; reason: "duplicate" };

export async function createProject(
  ownerEmail: string,
  name: string,
  dept: string
): Promise<CreateProjectResult> {
  // 부서/팀명 + 프로젝트명 조합 중복 검사
  const { data: dup } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_email", ownerEmail)
    .eq("name", name.trim())
    .eq("dept", dept.trim())
    .maybeSingle();
  if (dup) return { ok: false, reason: "duplicate" };

  const { data, error } = await supabase
    .from("projects")
    .insert({ name: name.trim(), dept: dept.trim(), owner_email: ownerEmail })
    .select("*")
    .single();
  if (error || !data) return { ok: false, reason: "duplicate" };
  return { ok: true, project: mapProject(data as ProjectRow) };
}

export type UpdateProjectResult =
  | { ok: true; project: Project }
  | { ok: false; reason: "duplicate" };

export async function updateProject(
  id: string,
  name: string,
  dept: string
): Promise<UpdateProjectResult> {
  const current = await getProject(id);
  if (!current) return { ok: false, reason: "duplicate" };
  const { data: dup } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_email", current.ownerEmail)
    .eq("name", name.trim())
    .eq("dept", dept.trim())
    .neq("id", id)
    .maybeSingle();
  if (dup) return { ok: false, reason: "duplicate" };

  const { data, error } = await supabase
    .from("projects")
    .update({ name: name.trim(), dept: dept.trim() })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return { ok: false, reason: "duplicate" };
  return { ok: true, project: mapProject(data as ProjectRow) };
}

export async function deleteProject(id: string) {
  // 자식 테이블은 ON DELETE CASCADE 로 함께 삭제됨
  await supabase.from("projects").delete().eq("id", id);
}

// ---------- 태스크 ----------
export async function getTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("week", { ascending: true })
    .order("order_index", { ascending: true });
  if (error || !data) return [];
  return (data as TaskRow[]).map(mapTask);
}

export interface TaskInput {
  week: number;
  importance: Importance;
  title: string;
  content: string;
  attachments: Attachment[];
}

export async function createTask(
  projectId: string,
  input: TaskInput
): Promise<Task | null> {
  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("week", input.week);
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      week: input.week,
      importance: input.importance,
      title: input.title.trim(),
      content: input.content.trim(),
      attachments: input.attachments,
      order_index: count ?? 0,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapTask(data as TaskRow);
}

export async function updateTask(
  taskId: string,
  input: TaskInput
): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      week: input.week,
      importance: input.importance,
      title: input.title.trim(),
      content: input.content.trim(),
      attachments: input.attachments,
    })
    .eq("id", taskId)
    .select("*")
    .single();
  if (error || !data) return null;
  return mapTask(data as TaskRow);
}

export async function deleteTask(taskId: string) {
  await supabase.from("tasks").delete().eq("id", taskId);
}

// 같은 챕터(week) 내 태스크 순서 일괄 저장
export async function reorderTasks(
  projectId: string,
  week: number,
  orderedTaskIds: string[]
) {
  await Promise.all(
    orderedTaskIds.map((id, index) =>
      supabase
        .from("tasks")
        .update({ order_index: index })
        .eq("id", id)
        .eq("project_id", projectId)
        .eq("week", week)
    )
  );
}

// ---------- 인수자 ----------
export async function getMembers(projectId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as MemberRow[]).map(mapMember);
}

// 인수자 목록 일괄 저장 (테이블 편집 후 저장) → upsert + 삭제 동기화
export async function saveMembers(projectId: string, rows: Member[]) {
  const existing = await getMembers(projectId);
  const keepIds = new Set(rows.map((r) => r.id));
  const toDelete = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);
  if (toDelete.length > 0) {
    await supabase.from("members").delete().in("id", toDelete);
  }
  if (rows.length > 0) {
    await supabase.from("members").upsert(
      rows.map((r) => ({
        id: r.id,
        project_id: projectId,
        name: r.name.trim(),
        email: r.email.trim(),
        rank: r.rank,
        dept: r.dept,
        manager: r.manager,
        note: r.note,
        completed_task_ids: r.completedTaskIds,
      }))
    );
  }
}

export function newMember(projectId: string): Member {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    projectId,
    name: "",
    email: "",
    rank: "",
    dept: "",
    manager: "",
    note: "",
    createdAt: Date.now(),
    completedTaskIds: [],
  };
}

// ---------- 질문 ----------
export async function getQuestions(projectId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("project_id", projectId)
    .order("week", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as QuestionRow[]).map(mapQuestion);
}

export async function createQuestion(
  projectId: string,
  week: number,
  title: string,
  content: string
): Promise<Question | null> {
  const { data, error } = await supabase
    .from("questions")
    .insert({
      project_id: projectId,
      week,
      title: title.trim(),
      content: content.trim(),
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapQuestion(data as QuestionRow);
}

// ---------- 진행도 계산 (대시보드) ----------
export interface MemberProgress {
  member: Member;
  byWeek: { week: number; done: number; total: number; pct: number }[];
  done: number;
  total: number;
  pct: number;
}

export async function getMemberProgress(
  projectId: string
): Promise<MemberProgress[]> {
  const [tasks, members] = await Promise.all([
    getTasks(projectId),
    getMembers(projectId),
  ]);
  const weeks = [1, 2, 3, 4];
  return members.map((member) => {
    const completed = new Set(member.completedTaskIds);
    const byWeek = weeks.map((week) => {
      const weekTasks = tasks.filter((t) => t.week === week);
      const done = weekTasks.filter((t) => completed.has(t.id)).length;
      const total = weekTasks.length;
      return {
        week,
        done,
        total,
        pct: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    });
    const total = tasks.length;
    const done = tasks.filter((t) => completed.has(t.id)).length;
    return {
      member,
      byWeek,
      done,
      total,
      pct: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });
}

// 첨부 파일 종류 추정
export function kindOf(fileName: string): Attachment["kind"] {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "mov"].includes(ext)) return "video";
  if (["pdf", "docx", "xlsx", "pptx", "hwp", "txt", "csv"].includes(ext))
    return "doc";
  return "etc";
}
