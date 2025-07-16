import { connectDB } from "./db";
import { startServer } from "./app";

const startApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    startServer();

    console.log("Data Reader application started successfully");
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
};

startApp();
