import { Worker } from "bullmq";
import { connection } from "./lib/rag/queue.js";
import { INDEXING_QUEUE, QUERY_QUEUE } from "./lib/config.js";
import { processSourceIndexing } from "./lib/indexer.js";
import { answerQuery } from "./lib/retriever.js";

// Worker that routes all jobs to the universal indexer
const indexingWorker = new Worker(
  INDEXING_QUEUE,
  async (job) => {
    console.log(`📥 Indexing job ${job.id}: ${job.data.originalName}`);
    const result = await processSourceIndexing(job.data);
    console.log(`   → ${result.chunks} chunk(s) indexed successfully`);
    return result;
  },
  { connection, concurrency: 2 }
);

// RAG pipeline worker
const queryWorker = new Worker(
  QUERY_QUEUE,
  async (job) => {
    console.log(`🔎 Query job ${job.id}: ${JSON.stringify(job.data.query)}`);
    const result = await answerQuery(job.data.query);
    console.log(`   → answered using ${result.sources.length} chunk(s)`);
    return result;
  },
  { connection, concurrency: 4 }
);

for (const [name, worker] of [
  ["indexing", indexingWorker],
  ["query", queryWorker],
]) {
  worker.on("completed", (job) => console.log(`✅ [${name}] job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`❌ [${name}] job ${job?.id} failed:`, err.message));
}

console.log("👷 Workers started (indexing + query). Waiting for jobs...");