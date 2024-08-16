import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
export class ErrorHandler {
  static handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
}

export const encrypt = (value: string, key: string) => {
  const iv = crypto.randomBytes(16);
  const algorithm = "aes-256-cbc";
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};
export const decrypt = (value: string, key: string) => {
  const algorithm = "aes-256-cbc";
  const iv = crypto.randomBytes(16);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(value, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
