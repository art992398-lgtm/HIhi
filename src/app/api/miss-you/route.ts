import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendLineMessage } from "@/lib/line";

const LEVELS: Record<string, { message: string; emoji: string }> = {
  little: { message: "คิดถึงนิดหน่อย 🌸", emoji: "🌸" },
  lot: { message: "คิดถึงมากเลย! 💕", emoji: "💕" },
  crazy: { message: "อยากเจอใจจะขาด!! 💖🥺", emoji: "💖" },
};

export async function POST(req: NextRequest) {
  try {
    const { level } = await req.json();
    const levelData = LEVELS[level];
    if (!levelData) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    await getAdminDb().collection("miss_you_events").add({
      level,
      message: levelData.message,
      timestamp: FieldValue.serverTimestamp(),
    });

    await sendLineMessage(levelData.message);

    return NextResponse.json({ ok: true, message: levelData.message });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
