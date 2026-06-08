"use client";

import { useEffect, useState } from "react";
import ProjectShell from "@/components/ProjectShell";
import Modal from "@/components/Modal";
import { getQuestions } from "@/lib/store";
import { type Question } from "@/lib/types";

const MAX_CONTENT = 500;
const ANSWER_KEY = "pm6.question.answers";

export default function QuestionsPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [answersById, setAnswersById] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<string | null>(null);

  const refresh = async () => setQuestions(await getQuestions(projectId));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`${ANSWER_KEY}:${projectId}`);
      if (raw) setAnswersById(JSON.parse(raw) as Record<string, string>);
    } catch {
      /* ignore */
    }
  }, [projectId]);

  const selected = questions.find((q) => q.id === selectedId) ?? null;
  useEffect(() => {
    if (!selected) {
      setAnswer("");
      return;
    }
    setAnswer(answersById[selected.id] ?? "");
  }, [selected, answersById]);

  const saveAnswersToStorage = (next: Record<string, string>) => {
    setAnswersById(next);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`${ANSWER_KEY}:${projectId}`, JSON.stringify(next));
  };

  const handleSave = async () => {
    if (!selected) return;
    if (answer.trim().length < 10) {
      setModal("답변 내용을 10자 이상 입력해주세요.");
      return;
    }
    if (answer.length > MAX_CONTENT) {
      setModal("답변은 500자 이내(공백 포함)로 작성해주세요.");
      return;
    }
    saveAnswersToStorage({
      ...answersById,
      [selected.id]: answer,
    });
    setModal("저장이 완료되었습니다.");
  };

  return (
    <ProjectShell projectId={projectId} pageTitle="인수자 질문 관리">
      <h2 className="mb-3 text-sm font-semibold text-ink-soft">질문 목록</h2>
      {questions.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-ink-faint">
          등록된 질문이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => setSelectedId(q.id)}
                className={`w-full rounded-xl border border-line bg-white p-4 text-left ${
                  selectedId === q.id ? "ring-2 ring-brand/30" : ""
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="rounded bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                      {q.week}주차
                    </span>
                    <span className="truncate text-sm font-semibold text-ink">
                      {q.title}
                    </span>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      answersById[q.id]?.trim()
                        ? "bg-canvas text-ink-soft"
                        : "bg-brand-soft text-brand"
                    }`}
                  >
                    {answersById[q.id]?.trim() ? "답변 완료" : "미답변"}
                  </span>
                </div>
                <p className="line-clamp-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {q.content}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-xs text-ink-faint">
            질문자 <span className="ml-1 text-ink-soft">인수자 사용자</span>
          </div>

          <label className="mb-1 block text-xs font-medium text-ink-soft">
            질문 내용
          </label>
          <div className="mb-4 rounded-lg bg-canvas px-3 py-2 text-sm text-ink-soft">
            {selected.content}
          </div>

          <label className="mb-1 block text-xs font-medium text-ink-soft">
            답변 내용
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder="답변 내용을 작성해주세요 (10자 이상, 500자 이내)"
            className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <p className="mt-1 text-right text-xs text-ink-faint">
            {answer.length} / {MAX_CONTENT}
          </p>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:bg-canvas"
            >
              취소
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
      )}

      <Modal
        open={modal !== null}
        message={modal ?? ""}
        onConfirm={() => setModal(null)}
      />
    </ProjectShell>
  );
}
