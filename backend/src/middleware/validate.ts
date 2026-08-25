import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

/**
 * Runs `schema` against req.body and replaces it with the parsed (and
 * coerced/defaulted) result, so handlers can trust req.body's shape instead
 * of re-deriving it from scratch with ad-hoc `if (!x) return 400` checks.
 * On failure, responds 400 with every field error zod collected, not just
 * the first one.
 */
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const zodErr = result.error as ZodError;
      return res.status(400).json({
        message: 'Validation failed',
        errors: zodErr.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}
