import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    return NextResponse.json({ uuid: randomUUID() });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate UUID" },
      { status: 500 },
    );
  }
}
