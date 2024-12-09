import Group from "../../../Models/Group/Group.model.js";
import GroupChat from "../../../Models/Chat/Group/GroupChat.model.js";
import User from "../../../Models/User/User.model.js";

export const getGroupInfo = async (req, res) => {
  try {
    const { handle } = req.params;
    if (!handle) {
      return res.status(400).json({ message: "Group handle is required" });
    }

    const group = await Group.findOne({ handle })
      .populate("members", "username avatar bio")
      .populate("createdBy", "username avatar");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json({ group, myId: req.user._id });
  } catch (error) {
    console.error("Error in getGroupInfo:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupJoinInfo = async (req, res) => {
  try {
    const { handle } = req.params;
    if (!handle) {
      return res.status(400).json({ message: "Group handle is required" });
    }

    const group = await Group.findOne({ handle }).select(
      "groupIcon name handle isPrivate createdAt "
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ group });
  } catch (error) {
    console.error("Error in getGroupInfo:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllGroupChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const groupChats = await Group.aggregate([
      { $match: { members: userId } },
      {
        $lookup: {
          from: "groupchats",
          localField: "_id",
          foreignField: "groupId",
          as: "groupMessages",
        },
      },
      {
        $addFields: {
          undeliveredMessages: {
            $filter: {
              input: "$groupMessages",
              as: "message",
              cond: {
                $not: { $in: [userId, "$$message.readBy"] },
              },
            },
          },
          latestMessage: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$groupMessages",
                  sortBy: { createdAt: -1 },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "latestMessage.senderId",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      {
        $addFields: {
          "latestMessage.senderName": {
            $arrayElemAt: ["$senderDetails.username", 0],
          },
        },
      },
      {
        $project: {
          name: 1,
          handle: 1,
          isPrivate: 1,
          groupIcon: 1,
          createdAt: 1,
          latestMessage: {
            message: 1,
            messageType: 1,
            createdAt: 1,
            senderName: 1,
            senderId: 1,
            isNotification: 1,
          },
          undeliveredCount: { $size: "$undeliveredMessages" },
        },
      },
      { $sort: { "latestMessage.createdAt": -1, createdAt: -1 } },
    ]);

    res
      .status(200)
      .json({ groupChats, groupIds: req.user.groups, myId: req.user._id });
  } catch (error) {
    console.error("Error in getAllGroupChats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupChat = async (req, res) => {
  try {
    const { handle } = req.params;

    const group = await Group.findOne({ handle });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupChat = await GroupChat.find({ groupId: group._id })
      .select(
        "message messageType createdBy createdAt senderId isNotification deliveredTo readBy isDeleted deletedBy"
      )
      .populate("senderId", "username avatar")
      .populate("deletedBy", "username")
      .sort({ createdAt: 1 });
    res.status(200).json({
      groupChat,
      group,
      myId: req.user._id,
      username: req.user.username,
    });
  } catch (error) {
    console.error("Error in getGroupChat:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      String(group.createdBy) !== String(req.user._id) &&
      !group.Admins.includes(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this group" });
    }

    await GroupChat.deleteMany({ groupId });

    await group.deleteOne();

    res
      .status(200)
      .json({ message: "Group and its chats deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroupChat:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const leaveGroupAsMember = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const userId = req.user._id;
    if (!group.members.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    group.members = group.members.filter(
      (member) => String(member) !== String(userId)
    );

    await group.save();

    res.status(200).json({ message: "You have successfully left the group" });
  } catch (error) {
    console.error("Error in deleteGroupAsMember:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { phoneNumber } = req.body;
    if (!groupId || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { members: user._id } },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: `${user.username} added successfully` });
  } catch (error) {
    console.error("Error in addMember:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { phoneNumber } = req.body;
    if (!groupId || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      !group.Admins.includes(req.user._id) &&
      String(group.createdBy) !== String(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to remove this member" });
    }

    group.members = group.members.filter(
      (member) => String(member) !== String(user._id)
    );

    await group.save();

    res.status(200).json({ message: `${user.username} removed successfully` });
  } catch (error) {
    console.error("Error in removeMember:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changeAdminName = async (req, res) => {
  try {
    const { newName, handle } = req.body;
    const group = await Group.findOne({ handle });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.Admins.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to change this admin name" });
    }

    group.Admins = group.Admins.map((admin) => {
      if (String(admin._id) === String(req.user._id)) {
        return {
          _id: admin._id,
          name: newName,
        };
      }
      return admin;
    });

    console.log("group: ", group.Admins);

    await group.save();

    res.status(200).json({
      message: "Admin name changed successfully",
      adminId: req.user._id,
    });
  } catch (error) {
    console.error("Error in changeAdminName:", error);
    res.status(500).json({ message: error.message });
  }
};
