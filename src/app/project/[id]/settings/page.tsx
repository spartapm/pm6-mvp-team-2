"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import {
  currentUser,
  deleteProject,
  getMembers,
  getProjects,
  updateProject,
} from "@/lib/store";
import type { Project } from "@/lib/types";

export default function SettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState(params.id);
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [modal, setModal] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadProjects = async (email: string) => {
    const list = await getProjects(email);
    setProjects(list);
    return list;
  };

  useEffect(() => {
    (async () => {
      const u = await currentUser();
      if (!u) {
        router.replace("/");
        return;
      }
      const list = await loadProjects(u.email);
      const target = list.find((p) => p.id === activeId) ?? list[0];
      if (target) {
        setActiveId(target.id);
        setName(target.name);
        setDept(target.dept);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectProject = (p: Project) => {
    setActiveId(p.id);
    setName(p.name);
    setDept(p.dept);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setModal("프로젝트명을 입력해 주세요.");
      return;
    }
    if (!dept.trim()) {
      setModal("부서/팀명을 입력해 주세요.");
      return;
    }
    const result = await updateProject(activeId, name, dept);
    if (!result.ok) {
      setModal("이미 등록되어 있습니다. 다시 확인해 주세요.");
      return;
    }
    const u = await currentUser();
    if (u) await loadProjects(u.email);
    setModal("저장이 완료되었습니다.");
  };

  const tryDelete = async () => {
    // 인수자가 존재하면 삭제 불가
    const members = await getMembers(activeId);
    if (members.length > 0) {
      setModal(
        "프로젝트에 등록된 인수자가 존재합니다.\n등록된 인수자를 확인해 주세요."
      );
      return;
    }
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    await deleteProject(activeId);
    setConfirmDelete(false);
    const u = await currentUser();
    const list = u ? await loadProjects(u.email) : [];
    if (list.length === 0) {
      router.replace("/project/new");
      return;
    }
    selectProject(list[0]);
    setModal("프로젝트가 삭제되었습니다.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-6">
        <button
          type="button"
          onClick={() => router.push(`/project/${activeId}/dashboard`)}
          className="text-base font-bold text-ink transition-colors hover:text-brand"
          title="홈(대시보드)으로"
        >
          인수인계 태스크 관리
        </button>
        <button
          type="button"
          onClick={() => router.push(`/project/${activeId}/tasks`)}
          className="rounded-lg border border-line px-4 py-1.5 text-sm font-medium text-ink-soft hover:bg-canvas"
        >
          나가기
        </button>
      </header>

      <div className="flex flex-1">
        {/* 프로젝트 목록 */}
        <aside className="flex w-64 flex-col border-r border-line bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-ink-faint">
            프로젝트 목록
          </p>
          <div className="flex-1 space-y-1">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProject(p)}
                className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  p.id === activeId
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:bg-canvas"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => router.push("/project/new")}
            className="mt-3 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas"
          >
            + 프로젝트 생성
          </button>
        </aside>

        {/* 설정 본문 */}
        <main className="flex-1 px-8 py-6">
          <div className="mx-auto max-w-xl">
            <h1 className="mb-6 text-xl font-bold text-ink">
              {name || "프로젝트"} 설정
            </h1>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <label className="mb-1 block text-sm font-medium text-ink-soft">
                프로젝트 명
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
              />

              <label className="mb-1 block text-sm font-medium text-ink-soft">
                부서 / 팀명
              </label>
              <input
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
              />

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={tryDelete}
                  className="rounded-lg bg-hard px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
                >
                  저장
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink-faint">
              인수자가 등록된 프로젝트는 삭제할 수 없습니다. 먼저 ‘인수자 관리’에서
              인수자를 정리해 주세요.
            </p>
          </div>
        </main>
      </div>

      <Modal
        open={confirmDelete}
        title="프로젝트 삭제"
        message="프로젝트를 삭제하시겠습니까?\n관련 태스크·질문도 함께 삭제됩니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
      <Modal
        open={modal !== null}
        message={modal ?? ""}
        onConfirm={() => setModal(null)}
      />
    </div>
  );
}
