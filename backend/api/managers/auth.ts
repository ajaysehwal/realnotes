import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth";
import { CookieOptions } from "express";
import {
  DEFAULT_DOMAIN,
  REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_NAME,
} from "../constants";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class Auth {
  private static getCookieOptions(
    maxAge: number,
    httpOnly: boolean
  ): CookieOptions {
    return {
      httpOnly,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge,
      path: "/",
    };
  }

  private static setCookies(
    res: Response,
    { accessToken, refreshToken }: TokenPair
  ): void {
    res.cookie(
      REFRESH_TOKEN_NAME,
      refreshToken,
      this.getCookieOptions(REFRESH_TOKEN_EXPIRY, false)
    );
    res.cookie(
      ACCESS_TOKEN_NAME,
      accessToken,
      this.getCookieOptions(ACCESS_TOKEN_EXPIRY, false)
    );
  }

  private static handleError(next: NextFunction, error: unknown): void {
    console.error("Auth error:", error);
    next(error);
  }

  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const tokens = await AuthService.register(email, password);
      Auth.setCookies(res, tokens);
      res.status(201).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      Auth.handleError(next, error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const tokens = await AuthService.login(email, password);
      Auth.setCookies(res, tokens);
      res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      Auth.handleError(next, error);
    }
  }

  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(400).json({ error: "User ID is missing." });
        return;
      }
      const userProfile = await AuthService.getUserProfile(uid);
      res.json(userProfile);
    } catch (error) {
      Auth.handleError(next, error);
    }
  }

  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.cookies[REFRESH_TOKEN_NAME];
      if (!token) {
        res.status(401).json({ error: "Refresh token is missing." });
        return;
      }
      const tokens = await AuthService.refreshToken(token);
      Auth.setCookies(res, tokens);
      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      Auth.handleError(next, error);
    }
  }
}

export { Auth };
