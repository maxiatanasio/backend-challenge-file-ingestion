import fs from "fs";
import readline from "readline";
import path from "path";
import os from "os";
import Person, { IPerson } from "../models/Person";

export interface FileProcessResult {
  success: boolean;
  totalRecords: number;
  savedRecords: number;
  errorLogPath?: string;
  processingTime: number;
  cpuUsage: {
    start: number;
    end: number;
    average: number;
  };
  memoryUsage: {
    start: number;
    end: number;
    peak: number;
  };
}

export class FileProcessService {
  private static readonly BATCH_SIZE = 100; // Process 100 records at a time

  /**
   * Process a text file containing person data separated by pipes using streams
   * @param fileLocation Absolute path to the file
   * @returns Promise<FileProcessResult>
   */
  static async processFile(fileLocation: string): Promise<FileProcessResult> {
    const startTime = Date.now();
    const startCpuUsage = process.cpuUsage();
    const startMemoryUsage = process.memoryUsage();

    const result: FileProcessResult = {
      success: false,
      totalRecords: 0,
      savedRecords: 0,
      processingTime: 0,
      cpuUsage: { start: 0, end: 0, average: 0 },
      memoryUsage: { start: 0, end: 0, peak: 0 },
    };

    // Create error log file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFileName = `processing-errors-${timestamp}.log`;
    const logFilePath = path.join(process.cwd(), "logs", logFileName);

    const errors: string[] = [];
    const cpuSamples: number[] = [];
    const memorySamples: number[] = [];

    try {
      // Validate file exists and is readable
      if (!fs.existsSync(fileLocation)) {
        const errorMsg = `File not found: ${fileLocation}`;
        errors.push(errorMsg);
        await this.writeErrorsToLog(errors, logFilePath, result);
        result.errorLogPath = logFilePath;
        return result;
      }

      // Create read stream and readline interface
      const fileStream = fs.createReadStream(fileLocation, {
        encoding: "utf-8",
      });
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let batch: Partial<IPerson>[] = [];
      let lineNumber = 0;
      let batchCount = 0;

      // Process file line by line using streams
      for await (const line of rl) {
        lineNumber++;

        // Collect metrics every 1000 lines
        if (lineNumber % 1000 === 0) {
          const currentCpuUsage = process.cpuUsage();
          const currentMemoryUsage = process.memoryUsage();

          cpuSamples.push(currentCpuUsage.user + currentCpuUsage.system);
          memorySamples.push(currentMemoryUsage.heapUsed);
        }

        // Skip empty lines
        if (!line.trim()) {
          continue;
        }

        try {
          const personData = this.parsePersonLine(line, lineNumber);

          if (personData) {
            batch.push(personData);

            // Process batch when it reaches the batch size
            if (batch.length >= this.BATCH_SIZE) {
              batchCount++;
              await this.processBatch(
                batch,
                result,
                errors,
                lineNumber - batch.length + 1
              );
              batch = []; // Reset batch
            }
          }
        } catch (error) {
          // Extract personalId from raw line for error reporting
          const fields = line.split("|").map((field) => field.trim());
          const personalId = fields.length >= 3 ? fields[2] : "N/A";

          const errorMsg = `Line ${lineNumber} - ${personalId}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          errors.push(errorMsg);
        }
      }

      // Process remaining records in the last batch
      if (batch.length > 0) {
        batchCount++;
        await this.processBatch(
          batch,
          result,
          errors,
          lineNumber - batch.length + 1
        );
      }

      // Calculate final metrics
      const endTime = Date.now();
      const endCpuUsage = process.cpuUsage();
      const endMemoryUsage = process.memoryUsage();

      // Calculate CPU usage
      const startCpuTotal = startCpuUsage.user + startCpuUsage.system;
      const endCpuTotal = endCpuUsage.user + endCpuUsage.system;
      const cpuDiff = endCpuTotal - startCpuTotal;
      const timeDiff = endTime - startTime;

      result.cpuUsage = {
        start: startCpuTotal,
        end: endCpuTotal,
        average:
          cpuSamples.length > 0
            ? cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length
            : 0,
      };

      // Calculate memory usage
      result.memoryUsage = {
        start: startMemoryUsage.heapUsed,
        end: endMemoryUsage.heapUsed,
        peak:
          memorySamples.length > 0
            ? Math.max(...memorySamples)
            : endMemoryUsage.heapUsed,
      };

      result.processingTime = timeDiff;

      // Write errors to log file if any
      if (errors.length > 0) {
        await this.writeErrorsToLog(errors, logFilePath, result);
        result.errorLogPath = logFilePath;
      }

      result.success = result.savedRecords > 0;

      return result;
    } catch (error) {
      const errorMsg = `File processing error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      errors.push(errorMsg);
      await this.writeErrorsToLog(errors, logFilePath, result);
      result.errorLogPath = logFilePath;
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Write errors to log file using streams
   * @param errors Array of error messages
   * @param logFilePath Path to the log file
   * @param result FileProcessResult with metrics
   */
  private static async writeErrorsToLog(
    errors: string[],
    logFilePath: string,
    result: FileProcessResult
  ): Promise<void> {
    try {
      const writeStream = fs.createWriteStream(logFilePath, {
        encoding: "utf-8",
      });

      // Write header with metrics
      writeStream.write(`Processing Errors - ${new Date().toISOString()}\n`);
      writeStream.write(`Total Errors: ${errors.length}\n`);
      writeStream.write(`Total Records: ${result.totalRecords}\n`);
      writeStream.write(`Saved Records: ${result.savedRecords}\n`);
      writeStream.write(`Processing Time: ${result.processingTime}ms\n`);
      writeStream.write(
        `CPU Usage - Start: ${result.cpuUsage.start}μs, End: ${
          result.cpuUsage.end
        }μs, Average: ${result.cpuUsage.average.toFixed(2)}μs\n`
      );
      writeStream.write(
        `Memory Usage - Start: ${(
          result.memoryUsage.start /
          1024 /
          1024
        ).toFixed(2)}MB, End: ${(result.memoryUsage.end / 1024 / 1024).toFixed(
          2
        )}MB, Peak: ${(result.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB\n\n`
      );

      // Write each error on a new line
      for (const error of errors) {
        writeStream.write(`${error}\n`);
      }

      // Close the stream
      writeStream.end();

      // Wait for the stream to finish writing
      await new Promise<void>((resolve, reject) => {
        writeStream.on("finish", () => resolve());
        writeStream.on("error", reject);
      });
    } catch (error) {
      // Removed: console.error('Failed to write error log:', error);
    }
  }

  /**
   * Process a batch of person records
   * @param batch Array of person data to process
   * @param result FileProcessResult to update
   * @param errors Array to collect errors
   * @param startLineNumber Starting line number for this batch
   */
  private static async processBatch(
    batch: Partial<IPerson>[],
    result: FileProcessResult,
    errors: string[],
    startLineNumber: number
  ): Promise<void> {
    // Removed: console.log(`Processing batch with ${batch.length} records...`);

    let successfulInserts = 0;

    // Process each record individually to handle partial failures
    for (let i = 0; i < batch.length; i++) {
      const personData = batch[i];
      const currentLineNumber = startLineNumber + i;

      try {
        const person = new Person(personData);
        await person.save();
        successfulInserts++;
      } catch (error) {
        const errorMsg = `Line ${currentLineNumber} - ${
          personData.personalId
        }: ${error instanceof Error ? error.message : "Unknown error"}`;
        // Removed: console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Removed: console.log(
    //   `Successfully inserted ${successfulInserts} out of ${batch.length} records in this batch`
    // );

    result.savedRecords += successfulInserts;
    result.totalRecords += batch.length;

    // Removed: console.log(
    //   `Updated result - savedRecords: ${result.savedRecords}, totalRecords: ${result.totalRecords}`
    // );
  }

  /**
   * Parse a single line of person data
   * @param line The line to parse
   * @param lineNumber Line number for error reporting
   * @returns Parsed person data or null if invalid
   */
  private static parsePersonLine(
    line: string,
    lineNumber: number
  ): Partial<IPerson> | null {
    const fields = line.split("|").map((field) => field.trim());

    // Expected fields: name|surname|personalId|status|dateOfEntry|pep|os (7 fields, no uuid)
    if (fields.length !== 7) {
      throw new Error(
        `Invalid number of fields. Expected 7, got ${fields.length}`
      );
    }

    const [name, surname, personalId, status, dateOfEntry, pep, os] = fields;

    // Validate required fields
    if (!name || !surname || !personalId || !status || !dateOfEntry) {
      throw new Error("Missing required fields");
    }

    // Validate status
    if (!["Activo", "Inactivo"].includes(status)) {
      throw new Error(
        `Invalid status: ${status}. Must be 'Activo' or 'Inactivo'`
      );
    }

    // Validate date
    const parsedDate = new Date(dateOfEntry);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date format: ${dateOfEntry}`);
    }

    // Validate boolean fields
    const pepBool = pep.toLowerCase() === "true";
    const osBool = os.toLowerCase() === "true";

    return {
      // uuid will be auto-generated by the model
      name,
      surname,
      personalId,
      status: status as "Activo" | "Inactivo",
      dateOfEntry: parsedDate,
      pep: pepBool,
      os: osBool,
    };
  }
}
