import { Logger } from '../../domain/interfaces.js';

/**
 * Log levels
 */
type LogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

/**
 * Logging service for ThinkGate-MCP
 */
class LoggingService implements Logger {
    private minLevel: LogLevel = 'log';
    private isEnabled: boolean = true;
    private prefix: string = '[ThinkGate]';

    /**
     * Initialize logging service
     */
    constructor() {
        // Check log level from environment
        const envLogLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
        if (envLogLevel && ['debug', 'info', 'log', 'warn', 'error'].includes(envLogLevel)) {
            this.minLevel = envLogLevel;
        }

        // Check if logging is disabled
        this.isEnabled = process.env.LOG_DISABLED !== 'true';
    }

    /**
     * Set minimum log level
     */
    setMinLevel(level: LogLevel): void {
        this.minLevel = level;
    }

    /**
     * Enable/disable logging
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    /**
     * Set prefix for logs
     */
    setPrefix(prefix: string): void {
        this.prefix = prefix;
    }

    /**
     * Log debug messages
     */
    debug(message: string, ...args: any[]): void {
        this.logWithLevel('debug', message, ...args);
    }

    /**
     * Log info messages
     */
    info(message: string, ...args: any[]): void {
        this.logWithLevel('info', message, ...args);
    }

    /**
     * Log regular messages
     */
    log(message: string, ...args: any[]): void {
        this.logWithLevel('log', message, ...args);
    }

    /**
     * Log warnings
     */
    warn(message: string, ...args: any[]): void {
        this.logWithLevel('warn', message, ...args);
    }

    /**
     * Log errors
     */
    error(message: string, ...args: any[]): void {
        this.logWithLevel('error', message, ...args);
    }

    /**
     * Log with specified level
     */
    private logWithLevel(level: LogLevel, message: string, ...args: any[]): void {
        if (!this.isEnabled) return;

        const levelPriority = {
            'debug': 0,
            'info': 1,
            'log': 2,
            'warn': 3,
            'error': 4
        };

        if (levelPriority[level] >= levelPriority[this.minLevel]) {
            const timestamp = new Date().toISOString();
            const formattedMsg = `${timestamp} ${this.prefix} [${level.toUpperCase()}] ${message}`;

            switch (level) {
                case 'debug':
                    console.debug(formattedMsg, ...args);
                    break;
                case 'info':
                    console.info(formattedMsg, ...args);
                    break;
                case 'log':
                    console.log(formattedMsg, ...args);
                    break;
                case 'warn':
                    console.warn(formattedMsg, ...args);
                    break;
                case 'error':
                    console.error(formattedMsg, ...args);
                    break;
            }
        }
    }
}

// Export a single instance of the logging service for use throughout the project
export const logService = new LoggingService();