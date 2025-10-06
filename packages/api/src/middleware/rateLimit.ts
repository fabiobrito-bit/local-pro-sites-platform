import rateLimit from 'express-rate-limit';

// General limiter (optioneel)
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Te veel verzoeken, probeer het later opnieuw',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuut
  max: 10, // max 10 requests per IP
  message: 'Te veel verzoeken, probeer het later opnieuw.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Te veel verzoeken, probeer het later opnieuw.',
});
