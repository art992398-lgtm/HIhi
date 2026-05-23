"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "./NavBar";

const LEVELS = [
  {
    key: "little",
    label: "คิดถึงนิดหน่อย",
    emoji: "🌸",
    color: "from-pink-100 to-rose-100",
    border: "border-pink-200",
    text: "text-pink-500",
    bg: "bg-pink-50 hover:bg-pink-100",
  },
  {
    key: "lot",
    label: "คิดถึงมากเลย!",
    emoji: "💕",
    color: "from-rose-100 to-pink-200",
    border: "border-rose-300",
    text: "text-rose-500",
    bg: "bg-rose-50 hover:bg-rose-100",
  },
  {
    key: "crazy",
    label: "อยากเจอใจจะขาด!!",
    emoji: "💖",
    color: "from-pink-200 to-red-200",
    border: "border-red-300",
    text: "text-red-500",
    bg: "bg-red-50 hover:bg-red-100",
  },
];

export default function MissYouPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [senderRole, setSenderRole] = useState<"me" | "partner">("me");
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleFromQuery = searchParams.get("role");
    const storedRole = window.localStorage.getItem("miss-you-role");
    const role = roleFromQuery === "partner" || roleFromQuery === "me"
      ? roleFromQuery
      : storedRole === "partner" || storedRole === "me"
        ? storedRole
        : process.env.NEXT_PUBLIC_MISS_YOU_ROLE === "partner"
          ? "partner"
          : "me";

    setSenderRole(role);
  }, [searchParams]);

  useEffect(() => {
    window.localStorage.setItem("miss-you-role", senderRole);
  }, [senderRole]);

  async function handlePress(level: string) {
    setLoading(level);
    setError(null);
    setSent(null);
    try {
      const res = await fetch("/api/miss-you", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, senderRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      setSent(data.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pb-20 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-pulse-heart inline-block">💌</div>
          <h1 className="text-3xl font-bold text-pink-600 mb-2">คิดถึงนะ</h1>
          <p className="text-pink-400 text-sm">กดเพื่อบอกให้แฟนรู้ว่าคุณคิดถึงเขา</p>
          <div className="mt-4 inline-flex rounded-full bg-pink-50 border border-pink-200 p-1 text-sm">
            <button
              type="button"
              onClick={() => setSenderRole("me")}
              className={`rounded-full px-4 py-1.5 transition-colors ${senderRole === "me" ? "bg-pink-500 text-white" : "text-pink-500"}`}
            >
              ผม
            </button>
            <button
              type="button"
              onClick={() => setSenderRole("partner")}
              className={`rounded-full px-4 py-1.5 transition-colors ${senderRole === "partner" ? "bg-pink-500 text-white" : "text-pink-500"}`}
            >
              partner
            </button>
          </div>
          <p className="mt-2 text-xs text-pink-400">ตอนนี้ส่งในนาม: {senderRole === "me" ? "ผม" : "partner"}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.key}
              onClick={() => handlePress(lvl.key)}
              disabled={loading !== null}
              className={`heart-btn w-full rounded-2xl border-2 ${lvl.border} ${lvl.bg} py-5 px-6 flex items-center gap-4 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <span className="text-4xl">{loading === lvl.key ? "⏳" : lvl.emoji}</span>
              <span className={`text-lg font-semibold ${lvl.text}`}>{lvl.label}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {sent && (
          <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-center animate-float">
            <p className="text-green-600 font-semibold">ส่งแล้ว! 🎉</p>
            <p className="text-green-500 text-sm mt-1">{sent}</p>
            <p className="text-green-400 text-xs mt-1">ข้อความถูกส่งทาง LINE แล้วนะ</p>
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Floating hearts */}
        <div className="fixed top-10 left-4 text-2xl opacity-30 animate-float" style={{ animationDelay: "0s" }}>💗</div>
        <div className="fixed top-24 right-6 text-xl opacity-20 animate-float" style={{ animationDelay: "1s" }}>💓</div>
        <div className="fixed top-40 left-8 text-lg opacity-25 animate-float" style={{ animationDelay: "2s" }}>🌸</div>
      </div>
      <NavBar />
    </div>
  );
}
