/** @format */
import { Request, Response, NextFunction } from "express";
import IAdmin from "../interfaces/admin.interface";
import adminsModel from "../models/admins.model";
import mongoose from "mongoose";
import createError from "http-errors";
import {
  managerRegisterInput,
  managerLoginInput,
  validatePasswordInput,
  validateAddNewAdminInput,
} from "../validate/admin.input";
import {
  comparePassword,
  generateToken,
  hashPassword,
  uploadImage,
} from "../utils/utils";
import CustomRequestAdmins from "../interfaces/CustomRequestAdmins";
import { ADMIN_ACCOUNT_PROFILE_FOLDER } from "../constant/constant";
import fileUpload from "express-fileupload";

/** 1. Register new Admin/Manager **/
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    const { error, value } = managerRegisterInput.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      throw next(createError.BadRequest(error.details[0].message));
    }

    const isAlreadyExists = await adminsModel.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (isAlreadyExists && isAlreadyExists.email === req.body.email) {
      throw next(createError.BadRequest("Email already exists"));
    } else if (isAlreadyExists && isAlreadyExists.phone === req.body.phone) {
      throw next(createError.BadRequest("Phone number already exists"));
    }
    // Hash user password
    const hashedPassword = await hashPassword(req.body.password);

    const newAdmin = new adminsModel({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.email,
      password: hashedPassword,
      accountType: req.body.accountType,
    });
    const managerData = await newAdmin.save();

    // Generate authentication token
    const token = await generateToken(managerData);
    return res.status(201).json({
      message: "Register successfull",
      status: 201,
      data: managerData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/** 2. Login for Admin/Manager **/
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    const { error, value } = managerLoginInput.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      throw next(createError.BadRequest(error.details[0].message));
    }
    const isExists = await adminsModel.findOne({ email: req.body.email });
    if (!isExists) {
      throw next(createError.BadRequest("No user found with this email"));
    }
    if (isExists && isExists.status === "inactive") {
      throw next(createError.BadRequest("Account set as inactive"));
    } else if (isExists && isExists.status === "deleted") {
      throw next(createError.BadRequest("Account set as deleted"));
    }
    // Compare password
    const isPasswordCorrect = await comparePassword(
      req.body.password,
      isExists.password
    );
    if (!isPasswordCorrect) {
      throw next(createError.BadRequest("Password is not correct"));
    }
    // Generate authentication token
    const token = await generateToken(isExists);
    return res.status(200).json({
      message: "Login successfull",
      status: 200,
      data: isExists,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/** 3. Get all lists of all manager & admins **/
export const getAllMembers = async (
  req: CustomRequestAdmins,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const query = req.query.sortType
      ? {
          $and: [
            { accountType: req.query.sortType },
            { status: { $ne: "deleted" } },
          ],
        }
      : {};

    const lists: IAdmin[] | [] = await adminsModel
      .find(query)
      .select("name email phone status accountType profileImage")
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    const documentCount = await adminsModel.countDocuments();
    return res.status(200).json({
      message: "Get all lists of admins",
      status: 200,
      data: lists,
      count: documentCount,
    });
  } catch (error) {
    next(error);
  }
};

/** 4. Search admins/manager by their name, email or phone number **/
export const searchMembers = async (
  req: CustomRequestAdmins,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const operations = req.query.value
      ? {
          $and: [
            {
              $or: [
                { name: { $regex: req.query.value, $options: "i" } },
                { email: { $regex: req.query.value, $options: "i" } },
                { phone: { $regex: req.query.value, $options: "i" } },
              ],
            },
            { status: "active" },
            { _id: { $ne: req.admin._id } },
          ],
        }
      : {
          $and: [{ status: "active" }, { _id: { $ne: req.admin._id } }],
        };

    const lists: IAdmin[] | [] = await adminsModel
      .find(operations)
      .select("name email phone status accountType profileImage")
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    const documentCount = await adminsModel.countDocuments();
    return res.status(200).json({
      message: "Get all search lists of admins",
      status: 200,
      data: lists,
      count: documentCount,
    });
  } catch (error) {
    next(error);
  }
};

/** 5. Update profile **/
export const updateAccountDetails = async (
  req: CustomRequestAdmins,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    const profileData = await adminsModel
      .findById(req.admin._id)
      .select("name profileImage");
    if (!profileData) {
      throw next(createError.BadRequest("No profile data found"));
    }
    let imageURL: string = "";
    if (req.files && req.files.image) {
      const image = req.files && (req.files.image as fileUpload.UploadedFile); // Type assertion
      imageURL = await uploadImage(
        image.tempFilePath,
        ADMIN_ACCOUNT_PROFILE_FOLDER
      );
    }
    const updatedProfileData = await adminsModel.findByIdAndUpdate(
      req.admin._id,
      {
        $set: {
          profileImage: imageURL || profileData?.profileImage,
          name: req.body.name || profileData?.name,
        },
      },
      { new: true }
    );
    return res.status(201).json({
      message: "Profile has been updated",
      status: 200,
      data: updatedProfileData,
    });
  } catch (error) {
    next(error);
  }
};

/** 6. Update account password **/
export const updateAccountPassword = async (
  req: CustomRequestAdmins,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    if (req.body.newPassword !== req.body.confirmPassword) {
      throw next(
        createError.BadRequest("Confirm password & New password did not match")
      );
    }
    const { error, value } = validatePasswordInput.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      throw next(createError.BadRequest(error.details[0].message));
    }
    const profileData = await adminsModel
      .findById(req.admin._id)
      .select("password");
    if (!profileData) {
      throw next(createError.BadRequest("No profile data found"));
    }
    const checkPassword = await comparePassword(
      req.body.currentPassword,
      profileData?.password
    );
    console.log(checkPassword);
    if (!checkPassword) {
      throw next(createError.BadRequest("Password did not matched"));
    }
    const hash = await hashPassword(req.body.newPassword);
    const updateProfile = await adminsModel
      .findByIdAndUpdate(
        req.admin._id,
        { $set: { password: hash } },
        { new: true }
      )
      .select("-password");
    return res
      .status(200)
      .json({ message: "Account password has been updated", status: 200 });
  } catch (error) {
    next(error);
  }
};

/** 7. Search profile by email or phone number **/

/** 8. Update password(When user forget their password) **/

/** 9. Delete account **/

/** 10. Add new admin account **/
export const addNewAdmin = async (
  req: CustomRequestAdmins,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    if (req.admin.accountType !== "manager") {
      throw next(
        createError.BadRequest("You don't have the authority to add new admin")
      );
    }
    const { error, value } = validateAddNewAdminInput.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      throw next(createError.BadRequest(error.details[0].message));
    }
    const isAlreadyExists = await adminsModel.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (isAlreadyExists && isAlreadyExists.email === req.body.email) {
      throw next(createError.BadRequest("Email already exists"));
    } else if (isAlreadyExists && isAlreadyExists.phone === req.body.phone) {
      throw next(createError.BadRequest("Phone already exists"));
    }
    const hash = await hashPassword(req.body.name);
    const newAdmin = new adminsModel({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hash,
    });
    const data = await newAdmin.save();
    return res
      .status(201)
      .json({ message: "A new admin has been added", status: 201, data });
  } catch (error) {
    next(error);
  }
};

/** 11. Update admin profile status **/
export const updateAdminProfileStatus = async (
  req: CustomRequestAdmins,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    if (req.admin.accountType !== "manager") {
      throw next(
        createError.BadRequest("You don't have the authority to add new admin")
      );
    }
    if (!req.body.statusType) {
      throw next(createError.BadRequest("Please mention status type"));
    }
    if (!req.params.id) {
      throw next(createError.BadRequest("Invalid id"));
    }
    const isAdminExists = await adminsModel
      .findById(req.params.id)
      .select("status accountType");
    if (!isAdminExists) {
      throw next(createError.BadRequest("No user exists"));
    }
    const updateStatus = await adminsModel
      .findByIdAndUpdate(
        req.params.id,
        { $set: { status: req.body.statusType } },
        { new: true }
      )
      .select("-password");
    return res.status(200).json({
      message: "Account status has been updated",
      status: 200,
      data: updateStatus,
    });
  } catch (error) {
    next(error);
  }
};
