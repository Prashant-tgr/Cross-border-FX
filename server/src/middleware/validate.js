import { AppError } from './error.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Update req with parsed/sanitized values
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    const errorDetails = error.errors?.map((err) => ({
      field: err.path.slice(1).join('.'),
      message: err.message,
    }));
    next(new AppError('Input validation failed', 400, errorDetails));
  }
};
