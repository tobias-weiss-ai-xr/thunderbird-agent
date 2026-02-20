// src/utils/logger.ts
// Logging utilities for debugging thunderbird-mcp

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: {
    source?: string;
    messageId?: string;
    action?: string;
    [key: string]: any;
  };
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private enabled: boolean = true;

  constructor() {
    this.enabled = process.env.MCP_DEBUG === 'true' || process.env.DEBUG?.includes('thunderbird');
  }

  private log(level: LogLevel, message: string, context?: any) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context
    };

    // Store in memory (with limit)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console
    const timestamp = new Date(entry.timestamp).toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] [DEBUG] ${message}${contextStr}`);
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] [INFO] ${message}${contextStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] [WARN] ${message}${contextStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`[${timestamp}] [ERROR] ${message}${contextStr}`);
        break;
    }
  }

  debug(message: string, context?: any) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: any) {
    this.log(LogLevel.ERROR, message, context);
  }

  // Get logs for debugging
  getLogs(level?: LogLevel, since?: number): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (since) {
      filtered = filtered.filter(log => log.timestamp >= since);
    }

    return filtered;
  }

  // Clear logs
  clear() {
    this.logs = [];
  }

  // Get statistics
  getStats() {
    return {
      total: this.logs.length,
      debug: this.logs.filter(l => l.level === LogLevel.DEBUG).length,
      info: this.logs.filter(l => l.level === LogLevel.INFO).length,
      warn: this.logs.filter(l => l.level === LogLevel.WARN).length,
      error: this.logs.filter(l => l.level === LogLevel.ERROR).length
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export const log = {
  debug: (message: string, context?: any) => logger.debug(message, context),
  info: (message: string, context?: any) => logger.info(message, context),
  warn: (message: string, context?: any) => logger.warn(message, context),
  error: (message: string, context?: any) => logger.error(message, context),
  getLogs: (level?: LogLevel, since?: number) => logger.getLogs(level, since),
  getStats: () => logger.getStats(),
  clear: () => logger.clear()
};