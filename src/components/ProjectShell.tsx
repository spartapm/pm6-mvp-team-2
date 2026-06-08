"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  currentUser,
  getProject,
  getProjects,
  logout,
} from "@/lib/store";
import type { Handover, Project } from "@/lib/types";

const NAV = [
  { key: "dashboard", label: "대시보드" },
  { key: "tasks", label: "태스크 관리" },
  { key: "questions", label: "인수자 질문 관리" },
  { key: "members", label: "인수자 관리" },
] as const;

export default function ProjectShell({
  projectId,
  pageTitle,
  children,
}: {
  projectId: string;
  pageTitle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Handover | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await currentUser();
      if (!u) {
        router.replace("/login");
        return;
      }
      const p = await getProject(projectId);
      if (!p || p.ownerEmail !== u.email) {
        router.replace("/login");
        return;
      }
      setUser(u);
      setProject(p);
      setProjects(await getProjects(u.email));
    })();
  }, [projectId, router]);

  if (!user || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-faint">
        불러오는 중…
      </div>
    );
  }

  const activeKey = NAV.find((n) => pathname.includes(`/${n.key}`))?.key ?? "tasks";

  const handleSwitchProject = (id: string) => {
    if (id === "new") {
      router.push("/project/new");
    } else {
      router.push(`/project/${id}/tasks`);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* 헤더 (고정) */}
      <header className="sticky top-0 z-30 grid h-14 grid-cols-[minmax(220px,360px)_1fr_auto] items-center border-b border-line bg-white px-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas"
          >
            <span className="truncate">{project.name}</span>
            <span className="ml-2 text-ink-faint">{dropdownOpen ? "▲" : "▼"}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 z-40 mt-1 animate-fade-in rounded-xl border border-line bg-white p-2 shadow-pop">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleSwitchProject(p.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    p.id === project.id
                      ? "bg-brand-soft font-semibold text-brand"
                      : "text-ink-soft hover:bg-canvas"
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id !== project.id && <span className="text-ink-faint">→</span>}
                </button>
              ))}
              <div className="my-1 border-t border-line" />
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  handleSwitchProject("new");
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-canvas"
              >
                + 새 프로젝트
              </button>
              <Link
                href={`/project/${project.id}/settings`}
                onClick={() => setDropdownOpen(false)}
                className="mt-1 block rounded-lg bg-ink px-3 py-2 text-center text-sm font-semibold text-white hover:opacity-90"
              >
                설정
              </Link>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Link href={`/project/${project.id}/dashboard`} title="홈(대시보드)으로">
            <BrandLogo />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm font-medium text-ink-faint hover:text-ink"
        >
          로그아웃
        </button>
      </header>

      <div className="flex flex-1">
        {/* 네비 (고정) */}
        <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-60 flex-col border-r border-line bg-white">
          <nav className="flex-1 px-3 pt-3">
            {NAV.map((item) => {
              const isActive = item.key === activeKey;
              const href = `/project/${project.id}/${item.key}`;
              const base =
                "mb-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium";
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`${base} ${
                    isActive
                      ? "bg-ink text-white"
                      : "text-ink-soft hover:bg-canvas"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 인계자 정보 (고정) */}
          <div className="m-3 rounded-xl bg-canvas p-4">
            <p className="text-xs text-ink-faint">인계자</p>
            <p className="mt-1 text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs text-ink-soft">{user.dept}</p>
            <p className="mt-1 truncate text-xs text-ink-faint">{user.email}</p>
          </div>
        </aside>

        {/* 콘텐츠 */}
        <main className="flex-1 px-8 py-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-xl font-bold text-ink">{pageTitle}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
