import { NextResponse } from "next/server";
import { enqueueQueryJob } from "@/lib/queue";

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Non-empty 'query' string required" }, { status: 400 });
    }

    const job = await enqueueQueryJob({ query: query.trim() });
    
    return NextResponse.json({
      message: "Query queued",
      jobId: job.id,
      poll: `/api/query/${job.id}`,
    }, { status: 202 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to queue query" }, { status: 500 });
  }
}