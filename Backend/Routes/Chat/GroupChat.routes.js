import express from "express";
import {
  addMember,
  changeAdminName,
  deleteGroup,
  getAllGroupChats,
  getGroupChat,
  getGroupInfo,
  getGroupJoinInfo,
  leaveGroupAsMember,
  removeMember,
} from "../../Controller/Chat/Group/GroupChat.controller.js";

const groupChatRouter = express.Router();

// User Actions
groupChatRouter.get("/get-group-info/:handle", getGroupInfo);
groupChatRouter.get("/get-all-group-chats", getAllGroupChats);
groupChatRouter.get("/get-group-chat/:handle", getGroupChat);
groupChatRouter.post("/leave-group/:groupId", leaveGroupAsMember);
groupChatRouter.get("/get-group-join-info/:handle", getGroupJoinInfo);

// Admin Actions
groupChatRouter.delete("/delete-group/:groupId", deleteGroup);

export default groupChatRouter;
