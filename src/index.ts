/** @format */

import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import createError from "http-errors";
import helmet from "helmet";
import logger from "morgan";
import dbConfigInit from "./configs/mongodb.config";
import cloudinaryInit from "./configs/cloudinary.config";
import fileUpload from "express-fileupload";

dotenv.config();
dbConfigInit();
cloudinaryInit();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger("dev"));
app.use(helmet());
app.use(
  fileUpload({
    useTempFiles: true, // Ensure the files are stored temporarily
    tempFileDir: "/tmp/", // Temp folder to store uploaded files
  })
);

import AdminRoute from "./routes/admins.routes";
app.use("/api/v1/admins", AdminRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound("Page not found"));
});
// Error message
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 401);
  res.send({
    error: {
      status: err.status || 401,
      message: err.message,
    },
  });
});

const port = process.env.PORT || 6060;

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
