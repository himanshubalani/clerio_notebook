import express from "express";
import cors from "cors"; 

const app = express();

app.use(cors({
  origin: "https://notebook.askclerio.dev",
  methods: ["GET", "POST"]
}));

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(config.port, () => {
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
});