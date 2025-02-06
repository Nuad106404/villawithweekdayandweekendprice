import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('rate-limiter');

// Create rate limiter
export const rateLimiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    next(new AppError(options.message, 429));
  }
});
