import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/quiz - create a new quiz session
// GET /api/quiz?id=xxx - get session
// PATCH /api/quiz - submit an answer

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const snap = await getAdminDb().collection("quiz_sessions").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ id: snap.id, ...snap.data() });
}

export async function POST(req: NextRequest) {
  const { setIndex } = await req.json();
  const idx = typeof setIndex === "number" ? setIndex : 0;

  const ref = await getAdminDb().collection("quiz_sessions").add({
    setIndex: idx,
    questionIndex: 0,
    person1Answer: null,
    person2Answer: null,
    results: [],
    createdAt: FieldValue.serverTimestamp(),
    status: "waiting_p1",
  });

  return NextResponse.json({ id: ref.id });
}

export async function PATCH(req: NextRequest) {
  const { id, person, answer } = await req.json();
  if (!id || !person || answer === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ref = getAdminDb().collection("quiz_sessions").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = snap.data()!;
  const update: Record<string, unknown> = {};

  if (person === "p1") {
    update.person1Answer = answer;
    update.status = "waiting_p2";
  } else if (person === "p2") {
    update.person2Answer = answer;
    const p1 = data.person1Answer;
    const matched = p1 === answer;
    const results = [...(data.results || []), { matched, p1Answer: p1, p2Answer: answer }];
    update.results = results;
    update.person1Answer = null;
    update.person2Answer = null;
    update.questionIndex = (data.questionIndex || 0) + 1;
    update.status = "waiting_p1";
  }

  await ref.update(update);
  const updated = await ref.get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}
