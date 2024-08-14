import { Request, Response } from "express";
import { AuthService } from "../services/auth";

export class Auth {
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      const { accessToken, refreshToken } = await AuthService.register(
        email,
        password
      );
      res.cookie("_refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("_access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({ accessToken });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const { refreshToken, accessToken } = await AuthService.login(
        email,
        password
      );
      res.cookie("_refresh_token", refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("_access_token", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).send({ accessToken });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    const uid = req.user!.uid;

    try {
      const userProfile = await AuthService.getUserProfile(uid);
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  static async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies._refresh;
    try {
      const { accessToken, refreshToken } = await AuthService.refreshToken(
        token
      );
      res.cookie("_refresh_token", refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("_access_token", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}
