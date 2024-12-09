import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useTheme from "../../../../Context/useTheme";
import { Link, useParams } from "react-router-dom";
import groupChatApi from "../../../../API/Chat/Group/GroupChatApi";
import toast from "react-hot-toast";
import { FaUserShield, FaUsers, FaTrashAlt, FaUserPlus } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import useSocket from "../../../../Context/UseSocket";
import { IoExitOutline } from "react-icons/io5";
import SearchContactToAddMember from "./SearchContactToAddMember";

const GroupInfo = () => {
  const { theme } = useTheme();
  const { handle } = useParams();
  const { socket } = useSocket();

  const [myId, setMyId] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [addMemberModal, setAddMemberModal] = useState(false);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const res = await groupChatApi.getGroupInfo(handle);
        setGroupDetails(res?.data?.group);
        setMyId(res?.data?.myId);
        const groupIds = [res?.data?.group?._id];
        socket.emit("request-group-online-users", groupIds);
      } catch (error) {
        console.error("Error fetching group info:", error);
        toast.error(
          error?.response?.data?.message || "Failed to fetch group details"
        );
      }
    };

    fetchGroupInfo();
  }, [handle]);

  // for error listening
  useEffect(() => {
    socket.on("member-removed-error", (data) => {
      const { message } = data;
      toast.error(message);
    });
  }, [socket]);

  // for success listening
  useEffect(() => {
    socket.on("member-removed", (data) => {
      const { groupId, memberId, memberName, adminName } = data;
      console.log("memberId: ", memberId, " ", memberName);
      setGroupDetails((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.filter((member) => member._id !== memberId),
        Admins: prevGroup.Admins.filter(
          (admin) => admin.toString() !== memberId.toString()
        ),
      }));
      setOnlineUsers((prevOnlineUsers) =>
        prevOnlineUsers.filter((user) => user._id !== memberId)
      );
      toast.success(`${adminName} removed ${memberName} from the group`);
    });

    socket.on("online-group-users", (data) => {
      setOnlineUsers(data.onlineUsers);
    });

    socket.on("left-group-member-info", (data) => {
      const { groupId, memberId, memberName } = data;
      setGroupDetails((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.filter((member) => member._id !== memberId),
      }));
      setOnlineUsers((prevOnlineUsers) =>
        prevOnlineUsers.filter((user) => user._id !== memberId)
      );
      toast(`${memberName} left the group`);
    });
    return () => {
      socket.off("member-removed");
      socket.off("online-group-users");
      socket.off("left-group-member-info");
    };
  }, [socket, groupDetails]);

  // for emitting
  useEffect(() => {
    if (!groupDetails) return;
    const groupIds = [groupDetails._id];
    socket.emit("request-group-online-users", groupIds);
  }, [socket]);

  const handleRemoveMember = (memberId, memberName) => {
    if (myId === memberId) return toast.error("You can't remove yourself");

    if (!groupDetails?.Admins?.includes(myId))
      return toast.error("You are not an admin");

    socket.emit("remove-member", {
      groupId: groupDetails._id,
      memberId,
      memberName,
    });
  };

  const handleLeaveGroup = () => {
    socket.emit("leave-group", { groupId: groupDetails._id });
  };

  const handleRemoveAdmin = async (adminId) => {
    socket.emit("remove-admin", { groupId: groupDetails._id, adminId });
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      <div className="flex flex-col py-3 gap-6 max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap gap-6 items-center justify-center md:justify-start">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between"
          >
            <div className="flex items-center gap-4">
              {groupDetails?.groupIcon ? (
                <img
                  src={groupDetails?.groupIcon}
                  alt={`${groupDetails.name} Icon`}
                  className="w-40 h-40 md:w-60 md:h-60 rounded-full shadow-md"
                />
              ) : (
                <div className="w-40 h-40 md:w-60 md:h-60 rounded-full shadow-md bg-gray-500 flex items-center justify-center">
                  <FaUsers className="text-white text-4xl md:text-5xl" />
                </div>
              )}
            </div>
          </motion.div>
          <div className="flex-1">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={`p-6 rounded-lg shadow-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h1
                className={`text-3xl md:text-4xl font-bold text-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } mb-4`}
              >
                {groupDetails?.name}
              </h1>
              <p
                className={`text-lg text-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } mb-6`}
              >
                <span className="font-semibold">Description: </span>
                {groupDetails?.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                  <h2 className="font-semibold text-xl flex items-center gap-2 mb-2">
                    <FaUsers />
                    Members
                  </h2>
                  <p className="text-2xl font-bold">
                    {groupDetails?.members.length}
                  </p>
                </div>

                <div className="flex flex-col items-center bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg shadow-lg">
                  <h2 className="font-semibold text-xl flex items-center gap-2 mb-2">
                    <FaUserShield />
                    Created By
                  </h2>
                  <p className="text-xl font-medium">
                    {groupDetails?.createdBy.username}
                  </p>
                </div>

                <div className="flex flex-col items-center bg-gradient-to-r from-yellow-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
                  <h2 className="font-semibold text-xl mb-2">Created On</h2>
                  <p className="text-xl font-medium">
                    {new Date(groupDetails?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 rounded-lg shadow-lg">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <span className="relative flex items-center justify-center w-3 h-3 bg-green-500 rounded-full">
                      <span className="absolute w-2 h-2 bg-white rounded-full animate-ping"></span>
                    </span>
                    Members Online
                  </h2>
                  <div className="flex items-center gap-2 text-lg font-extrabold">
                    {onlineUsers.length > 0 ? (
                      <>
                        <span className="animate-bounce">
                          {onlineUsers.length}
                        </span>
                      </>
                    ) : (
                      <span>No one online</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mt-6"
        >
          {groupDetails?.Admins?.includes(myId) && (
            <button
              className={`flex items-center justify-center gap-2 px-6 py-2 text-white rounded-lg ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-blue-500 hover:bg-blue-400"
              }`}
              onClick={() => setAddMemberModal(true)}
            >
              <FaUserPlus />
              Add Member
            </button>
          )}
          <button
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-500 hover:bg-red-400 text-white"
            }`}
          >
            <FaTrashAlt />
            Delete Group
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className={`p-6 rounded-lg mb-8  shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Group Members
          </h2>
          <div>
            <input
              type="text"
              placeholder="Search members"
              onChange={() => {
                // setGroupDetails(())
              }}
              className={`
              w-full px-4 py-2 rounded-lg mb-2 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }
              `}
            />
          </div>
          <div className="flex flex-col gap-4">
            {groupDetails?.members.map((member) => (
              <div
                key={member._id}
                className={`flex items-center hover:rounded-xl py-2 px-4 ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
                } justify-between gap-2 text-lg`}
              >
                <Link to={`/profile/${member._id}`} className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={member?.avatar}
                        alt={member?.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${
                          theme === "dark" ? "border-gray-800" : "border-white"
                        } ${
                          onlineUsers.includes(member?._id)
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      ></span>
                    </div>
                    <span>{member.username}</span>
                  </div>
                </Link>
                <div className="relative flex gap-2 items-center">
                  {groupDetails?.Admins.includes(member._id) && (
                    <div className="rounded-lg text-xs bg-green-400 px-2 py-1">
                      {"Admin"}
                    </div>
                  )}
                  {member._id === myId && (
                    <button onClick={handleLeaveGroup}>
                      <IoExitOutline className="text-2xl text-red-600 cursor-pointer" />
                    </button>
                  )}
                  <HiOutlineDotsVertical
                    className="text-2xl cursor-pointer"
                    onClick={() =>
                      setShowDropdown((prev) =>
                        prev === member._id ? null : member._id
                      )
                    }
                  />
                  {showDropdown === member._id && (
                    <div
                      className={`absolute text-sm right-0 top-8 z-10 w-40 ${
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800"
                      } shadow-md rounded-lg`}
                    >
                      <button
                        onClick={() => {
                          setShowDropdown(null);
                          handleRemoveMember(member._id, member.username);
                        }}
                        className={`block w-full hover:rounded-lg px-4 py-2 text-left text-red-600 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        Remove
                      </button>
                      {groupDetails?.createdBy._id !== member._id &&
                        groupDetails?.Admins.includes(member._id) && (
                          <button
                            onClick={() => handleRemoveAdmin(member._id)}
                            className={`block  w-full hover:rounded-lg px-4 py-2 text-left text-red-600 ${
                              theme === "dark"
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            Remove Admin
                          </button>
                        )}
                      <button
                        onClick={() => {
                          setShowDropdown(null);
                          handleRemoveMember(member._id, member.username);
                        }}
                        className={`block w-full hover:rounded-lg px-4 py-2 text-left text-red-600 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        Remove as Admin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {addMemberModal && (
        <SearchContactToAddMember
          groupId={groupDetails?._id}
          setAddMemberModal={setAddMemberModal}
          onlineUsers={onlineUsers}
        />
      )}
    </div>
  );
};

export default GroupInfo;
