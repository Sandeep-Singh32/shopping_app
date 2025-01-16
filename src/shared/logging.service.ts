import { Injectable, Scope } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      levels: winston.config.cli.levels,
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp to logs
        winston.format.json(), // Format logs as JSON for structured logging
      ),
      transports: [
        new winston.transports.Console({
          // Output logs to the console
          format: winston.format.combine(
            winston.format.colorize(), // Add colors for better readability
            winston.format.simple(), // Simplified format for console logs
          ),
        }),
      ],
    });

    this.logger.info('LoggerService initialized.');
  }

  /**
   * Logs informational messages.
   * @param message - The log message.
   * @param meta - Optional metadata to include with the log.
   */
  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  /**
   * Logs error messages.
   * @param message - The log message.
   * @param trace - Optional stack trace for the error.
   * @param meta - Optional metadata to include with the log.
   */
  error(message: string, trace?: string, meta?: Record<string, any>): void {
    this.logger.error(message, { trace, ...meta });
  }

  /**
   * Logs warning messages.
   * @param message - The log message.
   * @param meta - Optional metadata to include with the log.
   */
  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  /**
   * Logs debug messages.
   * @param message - The log message.
   * @param meta - Optional metadata to include with the log.
   */
  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  /**
   * Logs verbose messages.
   * @param message - The log message.
   * @param meta - Optional metadata to include with the log.
   */
  verbose(message: string, meta?: Record<string, any>): void {
    this.logger.verbose(message, meta);
  }
}
