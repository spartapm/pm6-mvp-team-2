"use client";

import { useEffect, useState } from "react";
import ProjectShell from "@/components/ProjectShell";
import Modal from "@/components/Modal";
import {
  currentUser,
  getMembers,
  newMember,
  saveMembers,
} from "@/lib/store";
import type { Member } from "@/lib/types";

const fmtDate = (ts: number) => {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function MembersPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [rows, setRows] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [managerName, setManagerName] = useState("");

  useEffect(() => {
    (async () => {
      setRows(await getMembers(projectId));
      const u = await currentUser();
      setManagerName(u?.name ?? "");
    })();
  }, [projectId]);

  const update = (id: string, patch: Partial<Member>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAdd = () => {
    const row = { ...newMember(projectId), manager: managerName };
    setRows((prev) => [...prev, row]);
  };

  const handleDelete = () => {
    setRows((prev) => prev.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
    setConfirmDelete(false);
    setToast("선택한 인수자가 삭제되었습니다. (저장 시 반영)");
  };

  const handleSave = async () => {
    // 필수값: 인수자 이름, 이메일
    const invalid = rows.some((r) => !r.name.trim() || !r.email.trim());
    if (invalid) {
      setToast("인수자 이름과 이메일은 필수 입력 항목입니다.");
      return;
    }
    await saveMembers(projectId, rows);
    setRows(await getMembers(projectId));
    setToast("변경 내용이 저장되었습니다.");
  };

  const cell =
    "w-full rounded-md border border-line bg-white px-2 py-1.5 text-sm outline-none focus:border-brand";

  return (
    <ProjectShell
      projectId={projectId}
      pageTitle="인수자 관리"
      contentMaxWidthClass="max-w-6xl"
    >
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:bg-canvas"
        >
          추가
        </button>
        <button
          type="button"
          onClick={() =>
            selected.size > 0
              ? setConfirmDelete(true)
              : setToast("삭제할 인수자를 선택해주세요.")
          }
          className="rounded-lg bg-hard px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          삭제
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          저장
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-canvas text-xs text-ink-soft">
              <th className="w-10 px-3 py-3" />
              <th className="w-[14%] px-3 py-3 font-medium">인수자 이름 *</th>
              <th className="w-[20%] px-3 py-3 font-medium">인수자 이메일 *</th>
              <th className="w-[10%] px-3 py-3 font-medium">직급</th>
              <th className="w-[14%] px-3 py-3 font-medium">소속 부서</th>
              <th className="w-[10%] px-3 py-3 font-medium">담당자</th>
              <th className="w-[18%] px-3 py-3 font-medium">비고</th>
              <th className="w-[14%] px-3 py-3 font-medium">생성일</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center text-sm text-ink-faint"
                >
                  등록된 인수자가 없습니다. ‘추가’ 버튼으로 인수자를 등록하세요.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-line last:border-b-0 ${
                    selected.has(r.id) ? "bg-hard/5" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.name}
                      onChange={(e) => update(r.id, { name: e.target.value })}
                      placeholder="이름"
                      className={cell}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.email}
                      onChange={(e) => update(r.id, { email: e.target.value })}
                      placeholder="email@example.com"
                      className={cell}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.rank}
                      onChange={(e) => update(r.id, { rank: e.target.value })}
                      placeholder="사원"
                      className={cell}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.dept}
                      onChange={(e) => update(r.id, { dept: e.target.value })}
                      placeholder="영업1팀"
                      className={cell}
                    />
                  </td>
                  <td className="px-3 py-2 text-sm text-ink-faint">
                    {r.manager || managerName}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.note}
                      onChange={(e) => update(r.id, { note: e.target.value })}
                      placeholder="메모"
                      className={cell}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-ink-faint">
                    {fmtDate(r.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={confirmDelete}
        title="인수자 삭제"
        message="삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
      <Modal
        open={toast !== null}
        message={toast ?? ""}
        onConfirm={() => setToast(null)}
      />
    </ProjectShell>
  );
}
