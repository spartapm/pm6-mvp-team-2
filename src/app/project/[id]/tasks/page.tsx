"use client";

import { useEffect, useState } from "react";
import ProjectShell from "@/components/ProjectShell";
import TaskForm, { type TaskFormValue } from "@/components/TaskForm";
import Modal from "@/components/Modal";
import {
  createTask,
  deleteTask,
  getTasks,
  reorderTasks,
  updateTask,
} from "@/lib/store";
import { IMPORTANCE_META, WEEKS, weekLabel, type Task } from "@/lib/types";

type FormState =
  | { mode: "closed" }
  | { mode: "add"; week: number }
  | { mode: "edit"; task: Task };

export default function TasksPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openWeeks, setOpenWeeks] = useState<number[]>([1, 2]);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [confirmReorder, setConfirmReorder] = useState<{
    week: number;
    orderedTaskIds: string[];
  } | null>(null);

  const refresh = async () => setTasks(await getTasks(projectId));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const toggleWeek = (w: number) =>
    setOpenWeeks((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
    );

  const handleSubmit = async (value: TaskFormValue) => {
    if (form.mode === "add") {
      await createTask(projectId, value);
    } else if (form.mode === "edit") {
      await updateTask(form.task.id, value);
    }
    setForm({ mode: "closed" });
    await refresh();
    setToast("저장이 완료되었습니다.");
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteTask(confirmDelete.id);
    setConfirmDelete(null);
    setForm({ mode: "closed" });
    await refresh();
    setToast("태스크가 삭제되었습니다.");
  };

  const moveTaskInWeek = (
    weekTasks: Task[],
    sourceId: string,
    targetId: string
  ): string[] => {
    const ids = weekTasks.map((t) => t.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0 || from === to) return ids;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };

  const handleConfirmReorder = async () => {
    if (!confirmReorder) return;
    await reorderTasks(projectId, confirmReorder.week, confirmReorder.orderedTaskIds);
    setConfirmReorder(null);
    await refresh();
    setToast("순서가 변경되었습니다.");
  };

  return (
    <ProjectShell projectId={projectId} pageTitle="태스크 관리">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setForm({ mode: "add", week: openWeeks[0] ?? 1 })}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          + 태스크 추가
        </button>
      </div>

      <div className="space-y-3">
        {WEEKS.map((w) => {
          const weekTasks = tasks
            .filter((t) => t.week === w)
            .sort((a, b) => a.order - b.order);
          const open = openWeeks.includes(w);
          return (
            <div
              key={w}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <button
                type="button"
                onClick={() => toggleWeek(w)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-xs text-brand">
                    {w}
                  </span>
                  {weekLabel(w)}
                  <span className="text-xs font-normal text-ink-faint">
                    ({weekTasks.length})
                  </span>
                </span>
                <span className="text-ink-faint">{open ? "▲" : "▼"}</span>
              </button>

              {open && (
                <div className="border-t border-line">
                  {weekTasks.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-ink-faint">
                      등록된 태스크가 없습니다.
                    </p>
                  ) : (
                    <ul>
                      {weekTasks.map((t) => {
                        const meta = IMPORTANCE_META[t.importance];
                        return (
                          <li
                            key={t.id}
                            draggable
                            onDragStart={() => setDragTaskId(t.id)}
                            onDragEnd={() => setDragTaskId(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (!dragTaskId || dragTaskId === t.id) return;
                              const ordered = moveTaskInWeek(weekTasks, dragTaskId, t.id);
                              setConfirmReorder({ week: w, orderedTaskIds: ordered });
                              setDragTaskId(null);
                            }}
                            className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0 hover:bg-canvas"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${meta.dot}`}
                                title={`중요도: ${meta.label}`}
                              />
                              <span
                                className="cursor-grab text-xs text-ink-faint"
                                title="드래그해서 순서 변경"
                              >
                                ↕
                              </span>
                              <span className="truncate text-sm text-ink">
                                {t.title}
                              </span>
                              {t.attachments.length > 0 && (
                                <span className="flex-shrink-0 text-xs text-ink-faint">
                                  📎 {t.attachments.length}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setForm({ mode: "edit", task: t })}
                              className="ml-3 flex-shrink-0 rounded-md px-2 py-1 text-xs text-ink-faint hover:bg-white hover:text-brand"
                              title="수정"
                            >
                              ✎ 수정
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 추가 / 수정 폼 */}
      {form.mode !== "closed" && (
        <TaskForm
          initial={form.mode === "edit" ? form.task : undefined}
          defaultWeek={form.mode === "add" ? form.week : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ mode: "closed" })}
          onDelete={
            form.mode === "edit"
              ? () => setConfirmDelete(form.task)
              : undefined
          }
        />
      )}

      {/* 삭제 확인 */}
      <Modal
        open={confirmDelete !== null}
        title="태스크 삭제"
        message="삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <Modal
        open={confirmReorder !== null}
        title="태스크 순서 변경"
        message="순서를 변경하시겠습니까?"
        confirmLabel="예"
        cancelLabel="아니오"
        onConfirm={handleConfirmReorder}
        onCancel={() => setConfirmReorder(null)}
      />

      {/* 저장/삭제 완료 토스트 */}
      <Modal
        open={toast !== null}
        message={toast ?? ""}
        onConfirm={() => setToast(null)}
      />
    </ProjectShell>
  );
}
