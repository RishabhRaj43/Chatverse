import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import groupChatApi from "../../../API/Chat/Group/GroupChatApi";
import { FaArrowRight, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import useSocket from "../../../Context/UseSocket";

const JoinGroupModal = ({
  isOpen,
  onClose,
  groupHandle,
  setGroupHandle,
  theme,
}) => {
  const { socket } = useSocket();
  const [groupInfo, setGroupInfo] = useState(null);
  const [searched, setSearched] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const getGroupnfo = async () => {
    setSearched(true);
    setGroupInfo(null);
    try {
      const res = await groupChatApi.getGroupJoinInfo(groupHandle);
      setGroupInfo(res.data.group);
      
      socket.emit("request-online-group-users-length", res.data.group._id);
    } catch (error) {
      console.error("Error fetching group info", error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (!groupInfo || !searched) return;
    socket.on("online-group-users-length", (data) => {
      if (data?.groupId === groupInfo?._id) {
        console.log("Id matched", data);
        setOnlineUsers(data.onlineUsers);
      }
    });
  }, [socket, groupInfo?._id, onlineUsers, searched]);

  const handleJoinGroup = () => {
    socket.emit("join-group", { groupId: groupInfo?._id });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={`p-6 rounded-lg shadow-lg max-w-sm w-full ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-gray-800"
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Join Group
            </h3>
            <div className="flex gap-2 mb-4 items-center">
              <input
                type="text"
                placeholder="Group Handle (starts with @)"
                value={groupHandle}
                onChange={(e) => {
                  setSearched(false);
                  setGroupHandle(e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-800"
                }`}
              />
              <button
                onClick={getGroupnfo}
                className={`relative px-6 py-2 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all duration-300
                ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white hover:shadow-lg hover:scale-105"
                    : "bg-gradient-to-r from-orange-400 via-red-300 to-yellow-300 text-gray-800 hover:shadow-md hover:scale-105"
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-800 via-red-700 to-yellow-700 opacity-0 transition-opacity duration-300 rounded-lg hover:opacity-30"></span>
                Search
              </button>
            </div>

            <div
              className={`mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              {groupInfo ? (
                <div className="w-full max-h-40 overflow-y-auto z-20">
                  <div
                    className={`flex items-center justify-between hover:rounded-lg px-4 py-2 ${
                      theme === "dark"
                        ? "bg-gray-800 text-white hover:bg-gray-600"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                    } cursor-pointer `}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={groupInfo?.groupIcon}
                        alt="Group Avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{groupInfo?.name}</p>
                        <p className="text-sm">{groupInfo?.description}</p>
                        <div className="flex items-center mt-2 gap-2 text-xs">
                          <span className="bg-green-500 w-3 h-3 rounded-full inline-block"></span>
                          <span>{onlineUsers} Members Online</span>
                        </div>
                        {/* Add the private group indicator here */}
                        {groupInfo?.isPrivate && (
                          <div className="flex items-center mt-1 text-sm text-red-500">
                            <FaLock className="mr-1" />{" "}
                            <span>Private Group</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg text-white flex justify-center items-center gap-2 ${
                        theme === "dark"
                          ? "bg-gradient-to-r from-green-600 via-teal-500 to-emerald-400 hover:from-green-500 hover:via-teal-400 hover:to-emerald-300"
                          : "bg-gradient-to-r from-green-500 via-teal-400 to-emerald-300 hover:from-green-400 hover:via-teal-300 hover:to-emerald-200"
                      }`}
                      onClick={() => handleJoinGroup(groupInfo?.handle)}
                    >
                      <span className="text-white">Join</span>
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {searched && groupHandle.length > 0 && "Group not found"}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSearched(false);
                  setGroupHandle("");
                  setGroupInfo(null);
                  setOnlineUsers([]);
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinGroupModal;
