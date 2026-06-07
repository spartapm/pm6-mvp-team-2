"use client";

interface ModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

// 단순 알림 / 확인 모달
export default function Modal({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel,
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm animate-fade-in rounded-2xl bg-white p-6 shadow-pop">
        {title && (
          <h3 className="mb-2 text-base font-semibold text-ink">{title}</h3>
        )}
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          {cancelLabel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:bg-canvas"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
