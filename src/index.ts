import { getLogger, configure } from "log4js";

export { ReassembleXMLFileHandler } from "./handlers/reassembleXMLFileHandler";
export { DisassembleXMLFileHandler } from "./handlers/disassembleXMLFileHandler";
export { parseXML } from "./parsers/parseXML";
export { buildXMLString } from "./builders/buildXMLString";
export { XmlElement } from "./types/types";

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
