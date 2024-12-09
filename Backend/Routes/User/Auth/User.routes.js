import express from "express";
import {
  uploadAvatar,
  userInfo,
  userLogin,
  userLogout,
  userSignup,
  userUpdate,
} from "../../../Controller/User/Auth/UserAuth.controller.js";
import userProtectRoute from "../../../Middlewares/UserProtectRoute.js";

const userRouter = express.Router();

userRouter.post("/signup", userSignup);
userRouter.post("/login", userLogin);
userRouter.get("/logout", userProtectRoute,userLogout);

userRouter.put("/update-user", userProtectRoute, userUpdate);

userRouter.get("/user-info", userProtectRoute, userInfo);

userRouter.post("/upload-avatar", userProtectRoute, uploadAvatar);

export default userRouter;
