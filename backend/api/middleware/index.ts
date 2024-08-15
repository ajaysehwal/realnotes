import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export class AuthMiddleware {
  static async verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const idToken = req.cookies._access_token;

    if (!idToken) {
      res.status(401).json({ error: "No token provided" });
      return;
    }
    try {
      const decodedToken = jwt.decode(idToken) as jwt.JwtPayload;
      req.user = { uid: decodedToken.uid, email: decodedToken.email as string };
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  }
}
