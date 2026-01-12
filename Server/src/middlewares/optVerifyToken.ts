import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtUserPayload } from "./verifyToken";

export const optVerifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;

  if (!token) {
    // No token → continue as guest
    return next();
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: jwt.VerifyErrors | null, payload: unknown) => {
      if (!err && typeof payload === "object" && payload && "id" in payload) {
        req.user = payload as JwtUserPayload; // attach user if valid
      }
      // If invalid, just continue as guest (do not block)
      next();
    }
  );
};
