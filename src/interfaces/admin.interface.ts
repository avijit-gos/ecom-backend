/** @format */

import mongoose from "mongoose";

interface IAdmin {
  readonly _id: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  profileImage: string;
  status: string;
  accountType: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default IAdmin;
