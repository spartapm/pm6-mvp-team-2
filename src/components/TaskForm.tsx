"use client";

import { useRef, useState } from "react";
import {
  IMPORTANCE_META,
  WEEKS,
  weekLabel,
  type Attachment,
  type Importance,
  type Task,
} from "@/lib/types";
import { kindOf } from "@/lib/store";

const MAX_FILES = 5;
const MAX_CONTENT = 10000;
const VIDEO_LIMIT = 500 * 1024 * 1024; // 500MB
const ETC_LIMIT = 20 * 1024 * 1024; // 20MB
const ACCEPT =
  ".pdf,.docx,.xlsx,.pptx,.hwp,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.zip";

export interface TaskFormValue {
  week: number;
  importance: Importance;
  title: string;
  content: string;
  attachments: Attachment[];
}

interface Props {
  initial?: Task;
  defaultWeek?: number;
  onSubmit: (value: TaskFormValue) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const fmtSize = (n: number) =>
  n > 1024 * 1024
    ? `${(n / 1024 / 1024).toFixed(1)}MB`
    : `${Math.max(1, Math.round(n / 1024))}KB`;

// 태스크 추가 / 수정 폼 (모달 내부)
export default function TaskForm({
  initial,
  defaultWeek = 1,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [week, setWeek] = useState<number>(initial?.week ?? defaultWeek);
  const [importance, setImportance] = useState<Importance>(
    initial?.importance ?? "normal"
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(
    initial?.attachments ?? []
  );
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = [...attachments];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_FILES) {
        setError(`첨부 파일은 최대 ${MAX_FILES}개까지 가능합니다.`);
        break;
      }
      const kind = kindOf(file.name);
      const limit = kind === "video" ? VIDEO_LIMIT : ETC_LIMIT;
      if (file.size > limit) {
        setError("파일 크기 제한을 초과했습니다. (영상 500MB / 그 외 20MB 이하)");
        continue;
      }
      next.push({
        id: `att-${Date.now()}-${next.length}`,
        name: file.name,
        size: file.size,
        kind,
      });
    }
    setAttachments(next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("태스크명을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    onSubmit({ week, importance, title, content, attachments });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-xl animate-fade-in rounded-2xl bg-white p-6 shadow-pop">
        <h3 className="mb-5 text-lg font-bold text-ink">
          {initial ? "태스크 수정" : "태스크 추가"}
        </h3>

        {/* 챕터 + 중요도 */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              챕터
            </label>
            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            >
              {WEEKS.map((w) => (
                <option key={w} value={w}>
                  {weekLabel(w)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              중요도
            </label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value as Importance)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            >
              {(Object.keys(IMPORTANCE_META) as Importance[]).map((k) => (
                <option key={k} value={k}>
                  중요도: {IMPORTANCE_META[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 태스크명 */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            태스크 명
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 핵심 업무 프로세스 실습"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>

        {/* 첨부 파일 */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            첨부 파일
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-soft hover:bg-canvas"
            >
              첨부하기
            </button>
            <span className="text-xs text-ink-faint">
              최대 5개 · 영상 500MB / 그 외 20MB
            </span>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-canvas px-3 py-1.5 text-xs"
                >
                  <span className="truncate text-ink-soft">
                    {a.name}{" "}
                    <span className="text-ink-faint">({fmtSize(a.size)})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(a.id)}
                    className="ml-2 text-ink-faint hover:text-hard"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 내용 */}
        <div className="mb-2">
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
            rows={5}
            placeholder="인수인계 내용을 입력하세요."
            className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <p className="mt-1 text-right text-xs text-ink-faint">
            {content.length.toLocaleString()} / {MAX_CONTENT.toLocaleString()}
          </p>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-hard/10 px-3 py-2 text-xs text-hard">
            {error}
          </p>
        )}

        {/* 액션 */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg bg-hard px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                삭제
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:bg-canvas"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
