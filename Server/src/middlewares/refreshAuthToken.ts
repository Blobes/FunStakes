import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import { genAccessTokens } from "@/helper";

export const refreshAuthToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;
    const user = { _id: payload.id };
    genAccessTokens(user, res);

    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(401).json({ message: "Expired or invalid refresh token" });
  }
};
