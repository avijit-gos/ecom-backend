/** @format */

import bcrypt from "bcrypt";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import IAdmin from "../interfaces/admin.interface";
import { v2 as cloudinary } from "cloudinary";
import cloudinaryInit from "../configs/cloudinary.config";

/** Hash password **/
export const hashPassword = async (password: string): Promise<void | any> => {
  try {
    const result: string = await bcrypt.hash(password, 10);
    return result;
  } catch (error) {
    throw createError.BadRequest("Could not hash password");
  }
};

/** Generate token **/
export const generateToken = async (data: IAdmin): Promise<void | any> => {
  try {
    const result: string = await jwt.sign(
      {
        _id: data._id,
        accountType: data.accountType,
        status: data.status,
      },
      process.env.JWT_ACCESS_KEY as string,
      { expiresIn: "365d" }
    );
    return result;
  } catch (error) {
    throw createError.BadRequest("Could not generate token");
  }
};

/** Compare password **/
export const comparePassword = async (
  password: string,
  accountPassword: string
): Promise<void | any> => {
  try {
    const result: boolean = await bcrypt.compare(password, accountPassword);
    return result;
  } catch (error) {
    throw createError.BadRequest("Could not compare password");
  }
};

export const uploadImage = async (
  image: any,
  folderName: string
): Promise<void | any> => {
  const result = await cloudinary.uploader.upload(image, {
    folder: folderName,
  });
  const updatedUrl = result.url.replace(process.env.IMAGE_PATH as string, "");
  return updatedUrl;
};
