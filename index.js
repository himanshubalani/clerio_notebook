import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(config.port, () => {
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
});