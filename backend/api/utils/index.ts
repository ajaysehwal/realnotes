
import { Request, Response, NextFunction } from 'express';

export class ErrorHandler {
  static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  }
}