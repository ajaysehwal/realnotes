import { auth } from "./firebase";
import { UserRecord } from "firebase-admin/auth";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
interface AuthToken {
  accessToken: string;
  refreshToken: string;
}
export class AuthService {
  private static readonly API_KEY = process.env.FIREBASE_API_KEY as string;
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "qw2wqkw298dbx329h829";
  private static readonly JWT_EXPIRATION = "15m";
  private static readonly REFRESH_TOKEN_EXPIRATION = "7d";
  static generateTokens(uid: string, email: string) {
    const accessToken = jwt.sign({ uid, email }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRATION,
    });

    const refreshToken = jwt.sign({ uid, email }, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }
  static async register(email: string, password: string): Promise<AuthToken> {
    if (!email && !password) {
      throw new Error("Email and password are required");
    }
    try {
      const userRecord = await auth.createUser({ email, password });
      const { accessToken, refreshToken } = this.generateTokens(
        userRecord.uid,
        userRecord.email!
      );
      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error(`Registration failed: ${(error as Error).message}`);
    }
  }

  static async login(email: string, password: string): Promise<AuthToken> {
    console.log(this.API_KEY);

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
      return { accessToken, refreshToken };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Login failed: ${error.response.data.error.message}`);
      } else {
        throw new Error(`Login failed: ${(error as Error).message}`);
      }
    }
  }

  static async getUserProfile(uid: string): Promise<UserRecord> {
    try {
      return await auth.getUser(uid);
    } catch (error) {
      throw new Error(
        `Failed to get user profile: ${(error as Error).message}`
      );
    }
  }
  static async refreshToken(token: string) {
    if (!token) {
      throw new Error("Token is required");
    }

    const decodedToken = jwt.verify(token, this.JWT_SECRET) as jwt.JwtPayload;

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      decodedToken.uid,
      decodedToken.email
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
}
