import { getLogger, configure } from "log4js";

export { ReassembleXMLFileHandler } from "./service/reassembleXMLFileHandler";
export { DisassembleXMLFileHandler } from "./service/disassembleXMLFileHandler";

// Function to update the log level
export function setLogLevel(level: string) {
  getLogger().level = level;
}

// Expose the logger
export const logger = getLogger();

configure({
  appenders: { disassemble: { type: "file", filename: "disassemble.log" } },
  categories: { default: { appenders: ["disassemble"], level: "error" } },
});
