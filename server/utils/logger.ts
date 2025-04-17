
/**
 * Environment-aware logger utility
 * Only logs in development environment by default
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level?: LogLevel;
  forceLog?: boolean;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Logs message only in development mode by default
   */
  log(message: string, options?: LoggerOptions): void {
    const { level = 'info', forceLog = false } = options || {};

    // Only log in development unless forceLog is true
    if (!this.isDevelopment && !forceLog) return;

    // Format timestamp
    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch(level) {
      case 'debug':
        console.debug(formattedMsg);
        break;
      case 'info':
        console.info(formattedMsg);
        break;
      case 'warn':
        console.warn(formattedMsg);
        break;
      case 'error':
        console.error(formattedMsg);
        break;
      default:
        // console.log(formattedMsg);
    }
  }

  debug(message: string, forceLog = false): void {
    this.log(message, { level: 'debug', forceLog });
  }

  info(message: string, forceLog = false): void {
    this.log(message, { level: 'info', forceLog });
  }

  warn(message: string, forceLog = false): void {
    this.log(message, { level: 'warn', forceLog });
  }

  error(message: string, forceLog = true): void {
    // Errors are always logged by default
    this.log(message, { level: 'error', forceLog });
  }
}

// Export singleton instance
export const logger = new Logger();
