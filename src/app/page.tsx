"use client";

import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 items-center justify-center border-b border-line bg-white px-6">
        <BrandLogo />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-3xl flex-col items-center">
          <BrandLogo size="hero" className="mb-6" />
          <div className="w-full rounded-2xl border border-line bg-white p-8 shadow-card">
            <h1 className="mb-8 text-center text-3xl font-bold text-ink">시작하기</h1>
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-xl bg-brand-soft/40 p-6">
                <h2 className="text-2xl font-bold text-ink">인계자 로그인</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {"인수인계를 진행하는 사람(인계자)입니다.\n\n코드북 설계 · 태스크 배정 · 진행 모니터링을 담당합니다."}
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-8 w-full rounded-lg bg-ink py-3 text-base font-semibold text-white hover:opacity-90"
                >
                  시작하기 →
                </button>
              </section>

              <section className="rounded-xl border border-line p-6">
                <h2 className="text-2xl font-bold text-ink">인수자 로그인</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {"인수인계를 받는 사람(인수자)입니다.\n\n단계별 태스크를 수행하고 질문을 남겨 바로바로 작업합니다."}
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-8 w-full rounded-lg bg-ink py-3 text-base font-semibold text-white hover:opacity-90"
                >
                  시작하기 →
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
