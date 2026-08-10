import jwt from "jsonwebtoken";

export class TokenManager {
  static generateToken(payload: object): string {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  static verifyToken(token: string) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
