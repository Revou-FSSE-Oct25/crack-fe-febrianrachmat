import { fetchApiHealth } from "@/lib/api/health";
import { NextResponse } from "next/server";

/** Proxy ringan ke backend GET /health untuk monitoring / status halaman. */
export async function GET() {
  try {
    const health = await fetchApiHealth();
    const httpStatus = health.status === "ok" ? 200 : 503;
    return NextResponse.json(
      { success: true, data: health },
      { status: httpStatus },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Backend health unreachable";
    return NextResponse.json(
      {
        success: false,
        data: { status: "degraded", database: "disconnected" as const },
        error: message,
      },
      { status: 503 },
    );
  }
}
