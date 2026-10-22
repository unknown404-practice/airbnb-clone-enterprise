import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body && req.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query && req.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params && req.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (err) {
    if (err instanceof z.ZodError || err.name === 'ZodError') {
      const issues = err.issues || err.errors || [];
      const errorMessages = issues.map((e) => `${e.path?.join('.') || 'field'}: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages.join('; ') || err.message}`,
        errors: issues,
      });
    }
    next(err);
  }
};

// Reusable Zod Schemas for API Endpoints
export const authSchemas = {
  register: {
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.enum(['guest', 'host']).optional().default('guest'),
    }),
  },
  login: {
    body: z.object({
      email: z.string().email('Invalid email address format'),
      password: z.string().min(1, 'Password is required'),
    }),
  },
};

export const bookingSchemas = {
  create: {
    body: z.object({
      listingId: z.string().min(1, 'Listing ID is required'),
      checkIn: z.string().min(1, 'Check-in date is required'),
      checkOut: z.string().min(1, 'Check-out date is required'),
      guestsCount: z.number().int().positive().optional().default(1),
      totalPrice: z.number().optional(),
    }),
  },
};

export const reviewSchemas = {
  create: {
    body: z.object({
      listingId: z.string().min(1, 'Listing ID is required'),
      rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
      comment: z.string().min(3, 'Comment must be at least 3 characters'),
      bookingId: z.string().optional(),
      subRatings: z
        .object({
          cleanliness: z.number().min(1).max(5).optional(),
          accuracy: z.number().min(1).max(5).optional(),
          communication: z.number().min(1).max(5).optional(),
          location: z.number().min(1).max(5).optional(),
          value: z.number().min(1).max(5).optional(),
        })
        .optional(),
    }),
  },
};
