import { auth } from "./firebase";
import { UserRecord } from "firebase-admin/auth";
import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config();

interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

interface DecodedToken extends jwt.JwtPayload {
  uid: string;
  email: string;
}

export class AuthService {
  private static readonly API_KEY = process.env.FIREBASE_API_KEY;
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  private static readonly ENCRYPT_KEY_SECRET = process.env.ENCRYPT_KEY_SECRET;
  private static readonly JWT_EXPIRATION = "15m";
  private static readonly REFRESH_TOKEN_EXPIRATION = "7d";

  private static validateEnvironmentVariables() {
    const requiredEnvVars = ['FIREBASE_API_KEY', 'JWT_SECRET', 'ENCRYPT_KEY_SECRET'];
    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });
  }

  private static getEncryptionKey(secret: string): Buffer {
    return crypto.scryptSync(secret, 'salt', 32);
  }

  private static encrypt(value: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.getEncryptionKey(key), iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private static decrypt(value: string, key: string): string {
    const [ivHex, encryptedHex] = value.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.getEncryptionKey(key), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private static generateTokens(uid: string, email: string): AuthToken {
    const accessToken = jwt.sign({ uid, email }, this.JWT_SECRET!, {
      expiresIn: this.JWT_EXPIRATION,
    });

    const refreshToken = jwt.sign({ uid, email }, this.JWT_SECRET!, {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION,
    });

    const encryptedRefreshToken = this.encrypt(refreshToken, this.ENCRYPT_KEY_SECRET!);

    return { accessToken, refreshToken: encryptedRefreshToken };
  }

  private static async verifyFirebaseToken(idToken: string): Promise<UserRecord> {
    const decodedToken = await auth.verifyIdToken(idToken);
    return await auth.getUser(decodedToken.uid);
  }

  static async register(email: string, password: string): Promise<AuthToken> {
    this.validateEnvironmentVariables();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      const userRecord = await auth.createUser({ email, password });
      return this.generateTokens(userRecord.uid, userRecord.email!);
    } catch (error) {
      throw new Error(`Registration failed: ${(error as Error).message}`);
    }
  }

  static async login(email: string, password: string): Promise<AuthToken> {
    this.validateEnvironmentVariables();

    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.API_KEY}`,
        { email, password, returnSecureToken: true }
      );

      const idToken = response.data.idToken;
      const userRecord = await this.verifyFirebaseToken(idToken);
      return this.generateTokens(userRecord.uid, email);
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
      throw new Error(`Failed to get user profile: ${(error as Error).message}`);
    }
  }

  static async refreshToken(encryptedToken: string): Promise<AuthToken> {
    this.validateEnvironmentVariables();

    if (!encryptedToken) {
      throw new Error("Token is required");
    }

    try {
      const decryptedToken = this.decrypt(encryptedToken, this.ENCRYPT_KEY_SECRET!);
      const decodedToken = jwt.verify(decryptedToken, this.JWT_SECRET!) as DecodedToken;
      return this.generateTokens(decodedToken.uid, decodedToken.email);
    } catch (error) {
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
    }
  }
}