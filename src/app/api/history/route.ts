import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export async function GET() {
  try {
    const q = query(collection(db, "miss_you_events"), orderBy("timestamp", "asc"));
    const snap = await getDocs(q);

    const events = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        level: data.level,
        message: data.message,
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? null,
      };
    });

    // Group by month
    const monthlyMap: Record<string, { month: string; little: number; lot: number; crazy: number; total: number }> = {};
    events.forEach((e) => {
      if (!e.timestamp) return;
      const d = new Date(e.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("th-TH", { month: "short", year: "numeric" });
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: label, little: 0, lot: 0, crazy: 0, total: 0 };
      }
      monthlyMap[key][e.level as "little" | "lot" | "crazy"]++;
      monthlyMap[key].total++;
    });

    const monthly = Object.values(monthlyMap);

    return NextResponse.json({ events, monthly, total: events.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
