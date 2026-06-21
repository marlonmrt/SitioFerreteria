import fs from "node:fs";
import path from "node:path";

const LOGS_DIR = path.join(process.cwd(), "logs");
const LOG_FILE_PATH = path.join(LOGS_DIR, "system.log");

function ensureLogDirectory() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

export function writeLog(level: "INFO" | "WARN" | "ERROR", message: string, context?: unknown) {
  try {
    ensureLogDirectory();
    const timestamp = new Date().toISOString();
    let logLine = `[${timestamp}] [${level}] ${message}`;
    if (context !== undefined) {
      logLine += ` | Context: ${JSON.stringify(context)}`;
    }
    logLine += "\n";

    fs.appendFileSync(LOG_FILE_PATH, logLine, "utf8");

    // Print to normal console for visibility in development/server logs
    if (level === "ERROR") {
      console.error(`[SYSTEM LOG ERROR] ${message}`, context !== undefined ? context : "");
    } else if (level === "WARN") {
      console.warn(`[SYSTEM LOG WARN] ${message}`, context !== undefined ? context : "");
    } else {
      console.log(`[SYSTEM LOG INFO] ${message}`, context !== undefined ? context : "");
    }
  } catch (err) {
    console.error("Failed to write to system log file:", err);
  }
}

export const logger = {
  info: (message: string, context?: unknown) => writeLog("INFO", message, context),
  warn: (message: string, context?: unknown) => writeLog("WARN", message, context),
  error: (message: string, context?: unknown) => writeLog("ERROR", message, context),
};
