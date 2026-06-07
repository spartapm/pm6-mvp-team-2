"use client";

import { useEffect, useState } from "react";
import ProjectShell from "@/components/ProjectShell";
import Gauge from "@/components/Gauge";
import { getMemberProgress, type MemberProgress } from "@/lib/store";

export default function DashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const [rows, setRows] = useState<MemberProgress[]>([]);

  useEffect(() => {
    (async () => setRows(await getMemberProgress(projectId)))();
  }, [projectId]);

  return (
    <ProjectShell projectId={projectId} pageTitle="대시보드">
      <p className="mb-4 text-sm text-ink-faint">
        인수자별 챕터 진행도를 한눈에 확인하세요.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-line bg-white px-4 py-12 text-center text-sm text-ink-faint">
          등록된 인수자가 없습니다. ‘인수자 관리’에서 추가해 주세요.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ member, byWeek, done, total, pct }) => (
            <div
              key={member.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-ink">
                      {member.name || "(이름 없음)"}
                    </span>
                    {member.rank && (
                      <span className="rounded bg-canvas px-1.5 py-0.5 text-xs text-ink-soft">
                        {member.rank}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-faint">
                    {[member.dept, member.email, `담당 ${member.manager || "-"}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-center">
                  <Gauge pct={pct} />
                  <span className="mt-1 text-[11px] text-ink-faint">
                    전체 진행도
                  </span>
                </div>
              </div>

              {/* 챕터별 달성율 */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {byWeek.map((w) => (
                  <div
                    key={w.week}
                    className="rounded-xl bg-canvas px-3 py-2 text-center"
                  >
                    <p className="text-xs text-ink-faint">{w.week}주차</p>
                    <p className="mt-1 text-sm font-bold text-ink">{w.pct}%</p>
                    <p className="text-[11px] text-ink-faint">
                      {w.done}/{w.total}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-right text-xs text-ink-soft">
                전체 {done}/{total} 완료
              </p>
            </div>
          ))}
        </div>
      )}
    </ProjectShell>
  );
}
