import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useTheme from "../../../Context/useTheme";
import { Link } from "react-router-dom";
import groupChatApi from "../../../API/Chat/Group/GroupChatApi";
import useSocket from "../../../Context/UseSocket";
import { motion } from "framer-motion";
import JoinGroupModal from "../../../Components/UI/Group/JoinGroupModal";
import CreateGroupModal from "../../../Components/UI/Group/CreateGroupModal";
import {
  AddedToGroup,
  handleOnlineGroupUsers,
  newGroupNotification,
} from "./GroupChatFunc";
import { FaPlus } from "react-icons/fa";

const Group = () => {
  const { socket } = useSocket();
  const { theme } = useTheme();

  const [groups, setGroups] = useState([]);
  const [myId, setMyId] = useState(null);
  const [onlineGroupUsers, setOnlineGroupUsers] = useState({});
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);
  const [groupHandle, setGroupHandle] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [groupIconUrl, setGroupIconUrl] = useState(null);

  useEffect(() => {
    document.title = "Group Chat";
    const fetchGroupChats = async () => {
      try {
        const res = await groupChatApi.getChats();
        setGroups(res.data.groupChats);
        const groupIds = res.data.groupIds;
        setMyId(res.data.myId);
        socket.emit("request-online-group-users-length", groupIds);
      } catch (error) {
        console.error("Error fetching groups", error);
        toast.error(error?.response?.data?.message);
      }
    };

    fetchGroupChats();
  }, []);

  // For error listener
  useEffect(() => {
    socket.on("create-group-error", (error) => {
      toast.error(error?.message);
    });
    socket.on("join-group-error", (error) => {
      toast.error(error?.message);
    });

    return () => {
      socket.off("create-group-error");
      socket.off("join-group-error");
    };
  }, [socket]);

  // for Success listener
  useEffect(() => {
    socket.on("online-group-users-length", (users) => {
      handleOnlineGroupUsers(users, setOnlineGroupUsers);
    });

    socket.on("create-group-success", (data) => {
      toast.success(`Group ${data.name} created successfully!`);
      setIsCreateGroupModalOpen(false);
      setGroupHandle("");
      setGroupName("");
      setGroupDescription("");
      setGroupMembers([]);
      setIsPrivate(false);
      setGroupIconUrl(null);
    });

    socket.on("added-to-group", (data) => {
      AddedToGroup(data, setGroups);
    });

    socket.on("joined-group-success", (data) => {
      AddedToGroup(data, setGroups);
      toast.success(
        data.successMessage || `Joined group ${data.group.name} successfully!`
      );
      setIsJoinGroupModalOpen(false);
      setGroupHandle("");
    });

    socket.on("new-group-notification", (data) => {
      toast.success(data.latestMessage.message);
      newGroupNotification(data, setGroups);
    });

    return () => {
      socket.off("online-group-users-length", handleOnlineGroupUsers);
      socket.off("create-group-success");
      socket.off("added-to-group");
      socket.off("joined-group-success");
      socket.off("new-group-notification");
    };
  }, [socket, onlineGroupUsers, groups]);

  const handleCreateGroup = async (data) => {
    if (!data.handle || !data.description || !data.name) {
      return toast.error("Every field is required.");
    }
    socket.emit("group-created", { data });
  };

  return (
    <div
      className={`px-4 py-6 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-800"
      } min-h-screen`}
    >
      <h2 className="text-3xl font-semibold mb-6">Groups</h2>

      <div className="flex justify-end gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateGroupModalOpen(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white shadow-md bg-gradient-to-r ${
            theme === "dark"
              ? "from-indigo-600 via-purple-600 to-pink-600 hover:opacity-80"
              : "from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
          } 
          transition-all`}
        >
          Create Group
          <FaPlus />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsJoinGroupModalOpen(true)}
          className={`px-4 py-2 rounded-lg text-white shadow-md 
            bg-gradient-to-r 
            ${
              theme === "dark"
                ? "from-green-500 via-blue-600 to-teal-600 hover:opacity-80"
                : "from-green-400 via-blue-500 to-teal-500 hover:opacity-90"
            } 
            transition-all`}
        >
          Join Group
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups
          ?.sort((a, b) => {
            const latestMessageA = new Date(a?.latestMessage?.createdAt);
            const latestMessageB = new Date(b?.latestMessage?.createdAt);

            if (latestMessageB - latestMessageA !== 0) {
              return latestMessageB - latestMessageA;
            }

            const createdAtA = new Date(a?.createdAt);
            const createdAtB = new Date(b?.createdAt);

            return createdAtB - createdAtA;
          })
          .map((group, index) => (
            <Link
              to={`/chat/group/${group?.handle}`}
              key={`${group?.handle}-${index}`}
            >
              <motion.div
                key={group?.handle}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-lg shadow-md p-4 flex items-center space-x-4 transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <div className="relative">
                  <img
                    src={group?.groupIcon || "/default-group-icon.png"}
                    alt={group?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {group?.name}
                    </h3>
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <div>
                        {group?.latestMessage?.createdAt
                          ? new Date(
                              group?.latestMessage?.createdAt
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : ""}
                      </div>
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {group?.latestMessage?.isNotification
                      ? group?.latestMessage?.message
                        ? group.latestMessage.message.length > 20
                          ? group.latestMessage.message.slice(0, 20) + "..."
                          : group.latestMessage.message
                        : "No messages yet"
                      : group?.latestMessage?.senderId?.toString() ===
                        myId?.toString()
                      ? "You: " + group?.latestMessage?.message
                      : group?.latestMessage?.senderName +
                        ": " +
                        group?.latestMessage?.message}
                  </p>
                  <div className="flex items-center mt-2 justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-green-500 w-3 h-3 rounded-full inline-block"></span>
                      <span>
                        {onlineGroupUsers[group?._id?.toString()]} Members
                        Online
                      </span>
                    </div>
                    {group?.undeliveredCount > 0 && (
                      <span
                        className={`top-0 right-0 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full shadow-lg ${
                          theme === "dark"
                            ? "border-2 border-gray-800"
                            : "border-2 border-gray-100"
                        }`}
                      >
                        {group?.undeliveredCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
      </div>

      {isCreateGroupModalOpen && (
        <CreateGroupModal
          isGroupOpen={isCreateGroupModalOpen}
          onGroupClose={() => setIsCreateGroupModalOpen(false)}
          onSubmit={handleCreateGroup}
          groupName={groupName}
          setGroupName={setGroupName}
          groupHandle={groupHandle}
          setGroupHandle={setGroupHandle}
          groupDescription={groupDescription}
          setGroupDescription={setGroupDescription}
          groupMembers={groupMembers}
          setGroupMembers={setGroupMembers}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          groupIconUrl={groupIconUrl}
          setGroupIconUrl={setGroupIconUrl}
          theme={theme}
        />
      )}
      {isJoinGroupModalOpen && (
        <JoinGroupModal
          isOpen={isJoinGroupModalOpen}
          onClose={() => setIsJoinGroupModalOpen(false)}
          groupHandle={groupHandle}
          setGroupHandle={setGroupHandle}
          setGroups={setGroups}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Group;
