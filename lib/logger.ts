/**
 * Minimal structured logger — emits single-line JSON so log output stays
 * greppable/parseable in any hosting platform's log viewer, instead of
 * free-form console.log strings.
 */
type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, event: string, meta?: Record<string, unknown>) {
  const entry = {
    level,
    event,
    time: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => emit("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => emit("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => emit("error", event, meta),
};
