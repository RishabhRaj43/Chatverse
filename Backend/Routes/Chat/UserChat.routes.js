import express from "express";
import {
  deleteChat,
  getChat,
  getUserChats,
} from "../../Controller/Chat/User/UserChat.controller.js";

const userChatRouter = express.Router();

userChatRouter.get("/get-all-chats", getUserChats);

userChatRouter.get("/get-chat/:id", getChat);
userChatRouter.delete("/delete-chat/:id", deleteChat);

export default userChatRouter;
