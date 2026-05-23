"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import NavBar from "./NavBar";

interface MonthData {
  month: string;
  little: number;
  lot: number;
  crazy: number;
  total: number;
}

interface HistoryData {
  total: number;
  monthly: MonthData[];
  events: { id: string; level: string; message: string; timestamp: string | null }[];
}

const LEVEL_LABELS: Record<string, string> = {
  little: "คิดถึงนิดหน่อย 🌸",
  lot: "คิดถึงมากเลย! 💕",
  crazy: "อยากเจอใจจะขาด!! 💖",
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-24 px-4 pt-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">📊</div>
          <h1 className="text-2xl font-bold text-pink-600">ประวัติการคิดถึง</h1>
        </div>

        {loading && (
          <div className="text-center text-pink-400 py-10 text-lg animate-pulse-heart">
            กำลังโหลด...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-500">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary card */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-5 mb-6 text-center shadow-sm">
              <p className="text-pink-400 text-sm mb-1">บอกคิดถึงกันไปแล้ว</p>
              <p className="text-5xl font-bold text-pink-500">{data.total}</p>
              <p className="text-pink-400 text-sm mt-1">ครั้ง 💌</p>
            </div>

            {/* Chart */}
            {data.monthly.length > 0 ? (
              <div className="bg-white rounded-2xl border border-pink-100 p-4 mb-6 shadow-sm">
                <h2 className="text-pink-500 font-semibold mb-3 text-sm">รายเดือน</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.monthly} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#f472b6" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#f472b6" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #fce7f3", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="little" name="นิดหน่อย" fill="#fbcfe8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lot" name="มากเลย" fill="#f472b6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="crazy" name="ใจจะขาด" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-pink-100 p-6 mb-6 text-center shadow-sm">
                <p className="text-pink-300 text-sm">ยังไม่มีประวัติ กดบอกคิดถึงกันเลยนะ!</p>
              </div>
            )}

            {/* Recent events */}
            {data.events.length > 0 && (
              <div className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm">
                <h2 className="text-pink-500 font-semibold mb-3 text-sm">ล่าสุด</h2>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {[...data.events].reverse().slice(0, 20).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between bg-pink-50 rounded-xl px-3 py-2"
                    >
                      <span className="text-sm text-pink-600">{LEVEL_LABELS[e.level] ?? e.message}</span>
                      {e.timestamp && (
                        <span className="text-xs text-pink-300 ml-2 whitespace-nowrap">
                          {new Date(e.timestamp).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <NavBar />
    </div>
  );
}
