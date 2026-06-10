"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import Modal from "@/components/Modal";
import { createProject, currentUser, getProjects } from "@/lib/store";
import type { Handover, Project } from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<Handover | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [modal, setModal] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await currentUser();
      if (!u) {
        router.replace("/login");
        return;
      }
      setUser(u);
      setProjects(await getProjects(u.email));
    })();
  }, [router]);

  const handleCreate = async () => {
    if (!user) return;
    // 필수 조건: 미입력 검증
    if (!name.trim()) {
      setModal("프로젝트명을 입력해 주세요.");
      return;
    }
    if (!dept.trim()) {
      setModal("부서/팀명을 입력해 주세요.");
      return;
    }

    const result = await createProject(user.email, name, dept);
    if (!result.ok) {
      // 등록 불가: 부서/팀명 + 프로젝트명 조합이 동일한 기존 데이터 존재
      setModal("동일한 부서/팀명과 프로젝트명이 이미 존재합니다.");
      return;
    }
    // 생성 완료 → 태스크 관리 화면으로 이동
    router.push(`/project/${result.project.id}/tasks`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-line bg-white px-6 text-sm font-semibold text-ink-soft">
        <div className="w-24" />
        <BrandLogo />
        {user && <span className="text-ink-faint">{user.name} 님</span>}
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          {projects.length > 0 && (
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-faint hover:text-ink"
            >
              ← 뒤로
            </button>
          )}
          <h1 className="mb-1 text-center text-2xl font-bold text-ink">
            프로젝트 생성
          </h1>
          <p className="mb-8 text-center text-sm text-ink-faint">
            인수인계를 진행할 프로젝트를 만들어 주세요.
          </p>

          <label className="mb-1 block text-sm font-medium text-ink-soft">
            프로젝트명
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          <label className="mb-1 block text-sm font-medium text-ink-soft">
            부서/팀명
          </label>
          <input
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="mb-6 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          <button
            type="button"
            onClick={handleCreate}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            프로젝트 생성
          </button>
        </div>
      </main>

      <Modal
        open={modal !== null}
        message={modal ?? ""}
        onConfirm={() => setModal(null)}
      />
    </div>
  );
}
