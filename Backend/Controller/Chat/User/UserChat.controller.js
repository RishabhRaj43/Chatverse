import UserChat from "../../../Models/Chat/User/UserChat.model.js";
import User from "../../../Models/User/User.model.js";
import mongoose from "mongoose";

export const getUserChats = async (req, res) => {
  try {
    const userChats = await UserChat.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            {
              receiverId: req.user._id,
              isBlocked: { $ne: true },
            },
            {
              senderId: req.user._id,
              isBlocked: true,
            },
          ],
        },
      },
      {
        $addFields: {
          commonChatId: {
            $cond: {
              if: { $lt: ["$senderId", "$receiverId"] },
              then: {
                $concat: [
                  { $toString: "$senderId" },
                  { $toString: "$receiverId" },
                ],
              },
              else: {
                $concat: [
                  { $toString: "$receiverId" },
                  { $toString: "$senderId" },
                ],
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$commonChatId",
          latestMessage: { $first: "$message" },
          createdAt: { $first: "$createdAt" },
          senderId: { $first: "$senderId" },
          receiverId: { $first: "$receiverId" },
          isDeleted: { $first: "$isDeleted" },
          newMessagesCount: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiverDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      {
        $unwind: { path: "$receiverDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$senderDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          latestMessage: 1,
          createdAt: 1,
          senderId: 1,
          receiverId: 1,
          isDeleted: 1,
          newMessagesCount: 1,
          receiverDetails: {
            id: "$receiverDetails._id",
            username: "$receiverDetails.username",
            avatar: "$receiverDetails.avatar",
            status: "$receiverDetails.status",
            email: "$receiverDetails.email",
            phoneNumber: "$receiverDetails.phoneNumber",
          },
          senderDetails: {
            id: "$senderDetails._id",
            username: "$senderDetails.username",
            avatar: "$senderDetails.avatar",
            status: "$senderDetails.status",
            email: "$senderDetails.email",
            phoneNumber: "$senderDetails.phoneNumber",
          },
        },
      },
    ]);

    userChats.forEach((chat) => {
      if (chat.senderId.toString() === req.user._id.toString()) {
        chat["otherUser"] = { ...chat.receiverDetails, myId: req.user._id };
        delete chat.senderDetails;
        delete chat.receiverDetails;
      } else if (chat.receiverId.toString() === req.user._id.toString()) {
        chat["otherUser"] = chat.senderDetails;
        delete chat.receiverDetails;
        delete chat.senderDetails;
      }
    });

    return res.status(200).json({ userChats, myId: req.user._id });
  } catch (error) {
    console.log("Error in getUserChats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChat = async (req, res) => {
  try {
    const senderId = req.params.id;
    const receiverId = req.user._id;

    const userChats = await UserChat.find({
      $or: [
        { senderId: senderId, receiverId: receiverId, isBlocked: false },

        { senderId: receiverId, receiverId: senderId, isBlocked: false },

        // in this recieverId is me means, he blocked me but i will be able to see my msgs
        { senderId: receiverId, isBlocked: true },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({ userChats });
  } catch (error) {
    console.error("Error in getChat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const readChat = async (req, res) => {
  try {
    const { id } = req.params;
    const receiverId = req.user.id;

    const updatedChats = await UserChat.updateMany(
      {
        senderId: id,
        receiverId: receiverId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );
    return res.status(200).json({ updatedChats });
  } catch (error) {
    console.log("Error in readChat", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    await UserChat.findByIdAndDelete(id);
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteChat", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
