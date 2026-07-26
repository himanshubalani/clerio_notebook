import { NextResponse } from "next/server";
import { queryQueue } from "@/lib/queue";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const job = await queryQueue.getJob(id);

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const state = await job.getState();

    if (state === "completed") {
      return NextResponse.json({ jobId: job.id, status: state, result: job.returnvalue });
    }
    if (state === "failed") {
      return NextResponse.json({ jobId: job.id, status: state, error: job.failedReason });
    }

    return NextResponse.json({ jobId: job.id, status: state });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}
