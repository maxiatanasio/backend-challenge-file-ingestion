import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { processFile } from "./controllers/processController";

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "data-reader",
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Data Reader API",
    version: "1.0.0",
  });
});

// Process file endpoint
app.post("/process", processFile);

export const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

export default app;
