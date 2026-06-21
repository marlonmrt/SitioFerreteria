import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger";

describe("System Logger Utility", () => {
  const logFilePath = path.join(process.cwd(), "logs", "system.log");

  it("should create system.log and write message with correct format", () => {
    const testMessage = "Test message for Vitest " + Math.random().toString();
    const testContext = { testKey: "testVal" };

    logger.info(testMessage, testContext);

    expect(fs.existsSync(logFilePath)).toBe(true);

    const content = fs.readFileSync(logFilePath, "utf8");
    expect(content).toContain("[INFO]");
    expect(content).toContain(testMessage);
    expect(content).toContain(JSON.stringify(testContext));
  });

  it("should handle error level logs", () => {
    const testMessage = "Test error message for Vitest " + Math.random().toString();
    logger.error(testMessage);

    const content = fs.readFileSync(logFilePath, "utf8");
    expect(content).toContain("[ERROR]");
    expect(content).toContain(testMessage);
  });
});
