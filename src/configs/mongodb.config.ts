/** @format */

import mongoose from "mongoose";

async function dbConfigInit() {
  try {
    mongoose.connect(process.env.DB_URL as string);
    mongoose.connection.on("error", () => console.log("DB is not connected"));
    mongoose.connection.on("connected", () => console.log("DB is connected"));
  } catch (error) {
    console.log("Error in DB");
  }
}
export default dbConfigInit;
