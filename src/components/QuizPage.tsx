"use client";
import { useState } from "react";
import NavBar from "./NavBar";
import { quizSets } from "@/lib/quizData";

type GameState = "select" | "waiting_p1" | "waiting_p2" | "result" | "done";

interface SessionData {
  id: string;
  setIndex: number;
  questionIndex: number;
  person1Answer: string | null;
  person2Answer: string | null;
  results: { matched: boolean; p1Answer: string; p2Answer: string }[];
  status: string;
}

export default function QuizPage() {
  const [gameState, setGameState] = useState<GameState>("select");
  const [session, setSession] = useState<SessionData | null>(null);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ matched: boolean; p1Answer: string; p2Answer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentSet = quizSets[selectedSetIndex];
  const currentQuestion = session ? currentSet?.questions[session.questionIndex] : null;
  const isGameDone = session && session.questionIndex >= (currentSet?.questions.length ?? 0);

  async function startGame() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setIndex: selectedSetIndex }),
      });
      const data = await res.json();
      setSession({ ...data, setIndex: selectedSetIndex, questionIndex: 0, results: [], person1Answer: null, person2Answer: null, status: "waiting_p1" });
      setGameState("waiting_p1");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(person: "p1" | "p2", answer: string) {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id, person, answer }),
      });
      const updated: SessionData = await res.json();
      setSession({ ...updated, setIndex: selectedSetIndex });

      if (person === "p2") {
        const results = updated.results;
        setLastResult(results[results.length - 1]);
        setGameState("result");
      } else {
        setGameState("waiting_p2");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (!session) return;
    const nextIdx = session.questionIndex;
    if (nextIdx >= currentSet.questions.length) {
      setGameState("done");
    } else {
      setGameState("waiting_p1");
    }
    setLastResult(null);
  }

  function resetGame() {
    setSession(null);
    setLastResult(null);
    setGameState("select");
    setError(null);
  }

  const score = session?.results.filter((r) => r.matched).length ?? 0;
  const total = session?.results.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col pb-24 px-4 pt-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎮</div>
          <h1 className="text-2xl font-bold text-pink-600">เกมตอบคำถาม</h1>
          <p className="text-pink-400 text-xs mt-1">ตอบแล้วดูว่าคิดตรงกันไหม!</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Select set */}
        {gameState === "select" && (
          <div>
            <p className="text-pink-500 font-semibold text-sm mb-3">เลือกชุดคำถาม</p>
            <div className="flex flex-col gap-3 mb-6">
              {quizSets.map((set, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSetIndex(i)}
                  className={`rounded-2xl border-2 px-4 py-3 flex items-center gap-3 transition-all text-left ${
                    selectedSetIndex === i
                      ? "border-pink-400 bg-pink-50"
                      : "border-pink-100 bg-white hover:bg-pink-50"
                  }`}
                >
                  <span className="text-2xl">{set.emoji}</span>
                  <div>
                    <p className={`font-semibold text-sm ${selectedSetIndex === i ? "text-pink-600" : "text-gray-600"}`}>
                      {set.title}
                    </p>
                    <p className="text-xs text-gray-400">{set.questions.length} คำถาม</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={startGame}
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl shadow-md transition-all text-lg"
            >
              {loading ? "กำลังเริ่ม..." : "เริ่มเลย! 🎉"}
            </button>
          </div>
        )}

        {/* Person 1 answers */}
        {gameState === "waiting_p1" && currentQuestion && !isGameDone && (
          <div>
            <div className="bg-pink-50 rounded-2xl p-3 mb-4 text-center">
              <span className="text-xs text-pink-400">คำถามที่ {(session?.questionIndex ?? 0) + 1}/{currentSet.questions.length}</span>
              <div className="flex justify-center gap-1 mt-1">
                {currentSet.questions.map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < (session?.questionIndex ?? 0) ? "bg-pink-400" : i === (session?.questionIndex ?? 0) ? "bg-pink-500" : "bg-pink-100"}`} />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-pink-100 p-5 mb-5 shadow-sm text-center">
              <p className="text-lg font-bold text-pink-700">คนแรกตอบก่อนนะ! 💁</p>
              <p className="text-gray-600 mt-3 text-base leading-relaxed">{currentQuestion.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => submitAnswer("p1", opt)}
                  disabled={loading}
                  className="rounded-xl border-2 border-pink-100 bg-white hover:bg-pink-50 hover:border-pink-300 text-gray-700 font-medium py-3 px-3 text-sm transition-all disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Person 2 answers */}
        {gameState === "waiting_p2" && currentQuestion && !isGameDone && (
          <div>
            <div className="bg-green-50 rounded-2xl border border-green-100 p-4 mb-5 text-center">
              <p className="text-green-600 font-semibold text-sm">✅ คนแรกตอบแล้ว!</p>
              <p className="text-green-500 text-xs mt-1">ส่งให้อีกฝ่ายตอบได้เลย</p>
            </div>
            <div className="bg-white rounded-2xl border border-pink-100 p-5 mb-5 shadow-sm text-center">
              <p className="text-lg font-bold text-pink-700">คนที่สองตอบได้เลย! 💁‍♀️</p>
              <p className="text-gray-600 mt-3 text-base leading-relaxed">{currentQuestion.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => submitAnswer("p2", opt)}
                  disabled={loading}
                  className="rounded-xl border-2 border-pink-100 bg-white hover:bg-pink-50 hover:border-pink-300 text-gray-700 font-medium py-3 px-3 text-sm transition-all disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result of question */}
        {gameState === "result" && lastResult && (
          <div>
            <div className={`rounded-2xl p-6 mb-5 text-center shadow-sm ${lastResult.matched ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              <div className="text-5xl mb-3">{lastResult.matched ? "🎉" : "😂"}</div>
              <p className={`text-xl font-bold ${lastResult.matched ? "text-green-600" : "text-orange-500"}`}>
                {lastResult.matched ? "ตรงกันเลย!" : "ไม่ตรงกัน!"}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-pink-100 p-4 mb-5 shadow-sm">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-pink-400">คนแรก:</span>
                <span className="text-sm font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">{lastResult.p1Answer}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-pink-50">
                <span className="text-sm text-pink-400">คนที่สอง:</span>
                <span className="text-sm font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">{lastResult.p2Answer}</span>
              </div>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 mb-5 text-center">
              <p className="text-xs text-pink-400">คะแนนตอนนี้</p>
              <p className="text-2xl font-bold text-pink-500">{score} / {total}</p>
            </div>
            <button
              onClick={nextQuestion}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-md transition-all text-lg"
            >
              {session && session.questionIndex >= currentSet.questions.length ? "ดูผลสรุป 🏆" : "ข้อต่อไป ➡️"}
            </button>
          </div>
        )}

        {/* Done */}
        {(gameState === "done" || isGameDone) && (
          <div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200 p-6 text-center mb-5 shadow-sm">
              <div className="text-5xl mb-3">
                {score === total ? "🏆" : score >= total / 2 ? "💕" : "😅"}
              </div>
              <p className="text-2xl font-bold text-pink-600 mb-1">จบแล้ว!</p>
              <p className="text-gray-600 mb-3">ตรงกัน {score} จาก {total} ข้อ</p>
              <div className="text-4xl font-extrabold text-pink-500 mb-2">
                {Math.round((score / total) * 100)}%
              </div>
              <p className="text-pink-400 text-sm">
                {score === total
                  ? "เข้าใจกันมากมาย!"
                  : score >= total / 2
                  ? "รู้จักกันดีมากเลยนะ!"
                  : "ต้องทำความรู้จักกันอีกนิดนะ!"}
              </p>
            </div>
            {/* Per-question breakdown */}
            <div className="bg-white rounded-2xl border border-pink-100 p-4 mb-5 shadow-sm">
              <p className="text-sm font-semibold text-pink-500 mb-3">สรุปคำตอบ</p>
              {session?.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-pink-50 last:border-0">
                  <span>{r.matched ? "✅" : "❌"}</span>
                  <div className="flex-1 text-xs text-gray-500 truncate">{currentSet.questions[i]?.question}</div>
                </div>
              ))}
            </div>
            <button
              onClick={resetGame}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-md transition-all text-lg"
            >
              เล่นอีกครั้ง 🔄
            </button>
          </div>
        )}
      </div>
      <NavBar />
    </div>
  );
}
