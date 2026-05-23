import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  for (const event of body.events ?? []) {
    const userId = event.source?.userId;
    if (userId) {
      // User ID จะแสดงใน Vercel Logs
      console.log("LINE User ID:", userId);
    }
  }

  return NextResponse.json({ ok: true });
}
