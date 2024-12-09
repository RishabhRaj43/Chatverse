import express from "express";
import userRouter from "./User/Auth/User.routes.js";
import userContactRouter from "./User/Contacts/UserContact.routes.js";
import userProtectRoute from "../Middlewares/UserProtectRoute.js";
import userChatRouter from "./Chat/UserChat.routes.js";
import groupChatRouter from "./Chat/GroupChat.routes.js";

const router = express.Router();

router.use("/auth", userRouter);

router.use("/contacts", userProtectRoute, userContactRouter);

router.use("/chat-user", userProtectRoute, userChatRouter);

router.use("/group", userProtectRoute, groupChatRouter);

export default router;
