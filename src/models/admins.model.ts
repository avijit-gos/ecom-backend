/** @format */

import mongoose from "mongoose";
import IAdmin from "../interfaces/admin.interface";

const AdminSchema = new mongoose.Schema<IAdmin>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, trim: true, required: [true, "Name is required"] },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
    },
    phone: {
      type: String,
      trime: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
    },
    profileImage: { type: String, default: "" },
    accountType: {
      type: String,
      default: "employee",
      enum: ["employee", "manager"],
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "deleted"],
    },
  },
  { timestamps: true }
);

AdminSchema.index({ name: 1 });
AdminSchema.index({ email: 1 });
AdminSchema.index({ phone: 1 });

export default mongoose.model("Admin", AdminSchema);
