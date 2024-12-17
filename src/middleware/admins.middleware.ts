/** @format */

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import CustomRequestAdmins from "../interfaces/CustomRequestAdmins";
import JwtPayload from "../interfaces/jwt.admins.payload";

export const validateAuthentication = async (
  req: CustomRequestAdmins,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string | undefined =
      req.body.token || req.headers["x-access-token"];
    if (!token) {
      throw next(createError.BadGateway("Invalid token"));
    }
    const verify = (await jwt.verify(
      token,
      process.env.JWT_ACCESS_KEY as string
    )) as JwtPayload;
    if (verify && verify.status === "inactive") {
      throw next(createError.BadRequest("User account inactive"));
    } else if (verify && verify.status === "deleted") {
      throw next(createError.BadRequest("User account deleted"));
    }
    req.admin = verify;
    next();
  } catch (error) {
    next(error);
  }
};
