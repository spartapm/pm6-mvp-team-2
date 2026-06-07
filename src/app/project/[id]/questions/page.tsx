"use client";

import { useEffect, useState } from "react";
import ProjectShell from "@/components/ProjectShell";
import Modal from "@/components/Modal";
import { createQuestion, getQuestions } from "@/lib/store";
import { WEEKS, weekLabel, type Question } from "@/lib/types";

const MAX_CONTENT = 500;

export default function QuestionsPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [week, setWeek] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modal, setModal] = useState<string | null>(null);

  const refresh = async () => setQuestions(await getQuestions(projectId));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const reset = () => {
    setTitle("");
    setContent("");
    setWeek(1);
  };

  const handleSave = async () => {
    // 와이어프레임 검증 순서
    if (!title.trim()) {
      setModal("챕터나 질문 제목이 입력되지 않았습니다.");
      return;
    }
    if (title.length < 5) {
      setModal("질문 제목을 5자 이상(공백 포함) 입력해주세요.");
      return;
    }
    if (content.length < 10) {
      setModal("질문 내용을 10자 이상(공백 포함) 입력해주세요.");
      return;
    }
    if (content.length > MAX_CONTENT) {
      setModal("질문은 500자 이내(공백 포함)로 작성해주세요.");
      return;
    }
    await createQuestion(projectId, week, title, content);
    reset();
    await refresh();
    setModal("질문이 저장되었습니다.");
  };

  return (
    <ProjectShell projectId={projectId} pageTitle="인수자 질문 관리">
      {/* 입력 폼 */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <label className="mb-1 block text-xs font-medium text-ink-soft">
          챕터 (주차)
        </label>
        <select
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="mb-4 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {WEEKS.map((w) => (
            <option key={w} value={w}>
              {weekLabel(w)}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-medium text-ink-soft">
          질문 제목
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="질문 제목을 입력하세요 (5자 이상)"
          className="mb-4 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
        />

        <label className="mb-1 block text-xs font-medium text-ink-soft">
          질문 내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="질문 내용을 입력하세요 (10자 이상, 500자 이내)"
          className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <p className="mt-1 text-right text-xs text-ink-faint">
          {content.length} / {MAX_CONTENT}
        </p>

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={reset}
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

      {/* 질문 목록 */}
      <h2 className="mb-3 mt-8 text-sm font-semibold text-ink-soft">질문 목록</h2>
      {questions.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-ink-faint">
          등록된 질문이 없습니다.
        </p>
      ) : (
        <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-xl border border-line bg-white p-4"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                  {q.week}주차
                </span>
                <span className="text-sm font-semibold text-ink">{q.title}</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {q.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modal !== null}
        message={modal ?? ""}
        onConfirm={() => setModal(null)}
      />
    </ProjectShell>
  );
}
