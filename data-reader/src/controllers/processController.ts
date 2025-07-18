import { Request, Response } from "express";
import { FileProcessService } from "../services/fileProcess";

export const processFile = async (req: Request, res: Response) => {
  const fileLocation = req.body?.fileLocation;

  if (!fileLocation) {
    return res.status(400).json({
      error: "fileLocation is required",
    });
  }

  try {
    // Process the file using the service
    const result = await FileProcessService.processFile(fileLocation);

    if (!result.success) {
      return res.status(400).json({
        error: "File processing failed",
        totalRecords: result.totalRecords,
        savedRecords: result.savedRecords,
        errorLogPath: result.errorLogPath,
      });
    }

    res.status(200).json({
      message: "File processed successfully",
      totalRecords: result.totalRecords,
      savedRecords: result.savedRecords,
      processingTime: result.processingTime,
      cpuUsage: {
        start: result.cpuUsage.start,
        end: result.cpuUsage.end,
        average: result.cpuUsage.average,
      },
      memoryUsage: {
        start: (result.memoryUsage.start / 1024 / 1024).toFixed(2) + "MB",
        end: (result.memoryUsage.end / 1024 / 1024).toFixed(2) + "MB",
        peak: (result.memoryUsage.peak / 1024 / 1024).toFixed(2) + "MB",
      },
      errorLogPath: result.errorLogPath, // Will be undefined if no errors
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
