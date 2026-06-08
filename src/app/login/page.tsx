"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import Modal from "@/components/Modal";
import { getProjects, login } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [modal, setModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setModal("이메일을 입력해 주세요.");
      return;
    }
    if (!code.trim()) {
      setModal("코드를 입력해 주세요.");
      return;
    }

    setLoading(true);
    const user = await login(email, code);
    if (!user) {
      setLoading(false);
      setModal("존재하지 않는 이메일 또는 코드입니다.\n관리자에게 문의하세요.");
      return;
    }

    const projects = await getProjects(user.email);
    if (projects.length === 0) {
      router.push("/project/new");
    } else {
      router.push(`/project/${projects[0].id}/dashboard`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-center border-b border-line bg-white px-6">
        <BrandLogo />
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
          <h1 className="mb-8 text-center text-2xl font-bold text-ink">로그인</h1>

          <label className="mb-1 block text-sm font-medium text-ink-soft">
            이메일
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ABCD1234@naver.com"
            className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          <label className="mb-1 block text-sm font-medium text-ink-soft">
            코드
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="UXPMP0123"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-6 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
          >
            {loading ? "확인 중…" : "로그인"}
          </button>

          <p className="mt-6 rounded-lg bg-canvas px-3 py-2 text-center text-xs leading-relaxed text-ink-faint">
            테스트 계정: ABCD1234@naver.com / UXPMP0123
          </p>
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
