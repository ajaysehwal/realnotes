import { auth } from "./firebase";
import { UserRecord } from "firebase-admin/auth";
import axios from "axios";
import jwt from "jsonwebtoken";
import { Response, Request } from "express";

export class AuthService {
  private static readonly API_KEY =
    process.env.FIREBASE_API_KEY || "your_firebase_api_key";
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your_jwt_secret";
  private static readonly JWT_EXPIRATION = "15m"; // 15 minutes for access tokens
  private static readonly REFRESH_TOKEN_EXPIRATION = "7d"; // 7 days for refresh tokens

  static generateTokens(uid: string, email: string) {
    const accessToken = jwt.sign({ uid, email }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRATION,
    });

    const refreshToken = jwt.sign({ uid, email }, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }

  static async register(
    email: string,
    password: string,
    res: Response
  ): Promise<void> {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      const userRecord = await auth.createUser({ email, password });

      const { accessToken, refreshToken } = this.generateTokens(
        userRecord.uid,
        userRecord.email!
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(201).send({ accessToken });
    } catch (error) {
      throw new Error(`Registration failed: ${(error as Error).message}`);
    }
  }

  static async login(
    email: string,
    password: string,
    res: Response
  ): Promise<void> {
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );

      const idToken = response.data.idToken;
      const decodedToken = await auth.verifyIdToken(idToken);

      const { accessToken, refreshToken } = this.generateTokens(
        decodedToken.uid,
        email
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).send({ accessToken });
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Login failed: ${error.response.data.error.message}`);
      } else {
        throw new Error(`Login failed: ${(error as Error).message}`);
      }
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).send("No refresh token provided");
      return;
    }

    try {
      const decodedToken = jwt.verify(
        refreshToken,
        this.JWT_SECRET
      ) as jwt.JwtPayload;

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
        decodedToken.uid,
        decodedToken.email
      );

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).send({ accessToken });
    } catch (error) {
      res.status(401).send("Invalid refresh token");
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken");
    res.status(200).send("Logged out successfully");
  }
}
