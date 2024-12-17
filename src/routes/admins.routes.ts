/** @format */

import express from "express";
import {
  addNewAdmin,
  getAllMembers,
  login,
  register,
  searchMembers,
  updateAccountDetails,
  updateAccountPassword,
  updateAdminProfileStatus,
} from "../controllers/admin.controller";
import { validateAuthentication } from "../middleware/admins.middleware";
const router = express.Router();

/** 1. Register new Manager **/
router.post("/register", register);

/** 2. Login for Admin/Manager **/
router.post("/login", login);

/** 3. Get all lists of all manager & admins **/
router.get("/", validateAuthentication, getAllMembers);

/** 4. Search admins/manager by their name, email or phone number **/
router.get("/search-members", validateAuthentication, searchMembers);

/** 5. Update profile **/
router.put("/update-profile", validateAuthentication, updateAccountDetails);

/** 6. Update account password **/
router.patch(
  "/update-account-password",
  validateAuthentication,
  updateAccountPassword
);

/** 7. Search profile by email or phone number **/

/** 8. Update password(When user forget their password) **/

/** 9. Delete account **/

/** 10. Add new admin account **/
router.post("/add-admin", validateAuthentication, addNewAdmin);

/** 11. Update admin profile status **/
router.patch(
  "/update-status/:id",
  validateAuthentication,
  updateAdminProfileStatus
);

export default router;
