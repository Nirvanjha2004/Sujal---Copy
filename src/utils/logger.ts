import config from '../config';

export interface LogContext {
  [key: string]: any;
}

export interface EmailLogData {
  email: string;
  emailType: string;
  success: boolean;
  error?: string;
  timestamp: string;
  maskedEmail: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Mask email address for privacy in logs
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    
    const maskedLocal = localPart.length > 2 
      ? `${localPart.substring(0, 2)}***${localPart.slice(-1)}`
      : `${localPart.charAt(0)}***`;
    
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Log email delivery attempts with structured data
   */
  logEmailDelivery(data: {
    email: string;
    emailType: string;
    success: boolean;
    error?: Error | string;
    additionalContext?: LogContext;
  }): void {
    const logData: EmailLogData = {
      email: this.isDevelopment ? data.email : '[REDACTED]',
      emailType: data.emailType,
      success: data.success,
      timestamp: new Date().toISOString(),
      maskedEmail: this.maskEmail(data.email),
    };

    if (data.error) {
      logData.error = data.error instanceof Error ? data.error.message : data.error;
    }

    const logMessage = `Email ${data.success ? 'sent successfully' : 'delivery failed'}`;
    const contextData = {
      ...logData,
      ...data.additionalContext,
    };

    if (data.success) {
      this.info(logMessage, contextData);
    } else {
      this.error(logMessage, contextData);
    }
  }

  /**
   * Log info level messages
   */
  info(message: string, context?: LogContext): void {
    const logEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context ? JSON.stringify(context, null, 2) : '');
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Log error level messages
   */
  error(message: string, context?: LogContext): void {
    const logEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, context ? JSON.stringify(context, null, 2) : '');
    } else {
      console.error(JSON.stringify(logEntry));
    }
  }

  /**
   * Log warning level messages
   */
  warn(message: string, context?: LogContext): void {
    const logEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context ? JSON.stringify(context, null, 2) : '');
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  }

  /**
   * Log debug level messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;

    const logEntry = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context, null, 2) : '');
  }

  /**
   * Ensure no OTP codes are logged in production
   */
  sanitizeForProduction(data: any): any {
    if (!this.isProduction) return data;

    const sanitized = { ...data };
    
    // Remove any fields that might contain OTP codes
    const sensitiveFields = ['otp', 'code', 'token', 'password', 'secret'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

export default new Logger();