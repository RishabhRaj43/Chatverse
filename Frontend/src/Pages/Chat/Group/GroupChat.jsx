import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaArrowLeft, FaUserPlus, FaEllipsisV } from "react-icons/fa";
import { CgAttachment } from "react-icons/cg";
import toast from "react-hot-toast";
import groupChatApi from "../../../API/Chat/Group/GroupChatApi";
import { Link, useNavigate, useParams } from "react-router-dom";
import useTheme from "../../../Context/useTheme";
import useSocket from "../../../Context/UseSocket";
import { newGroupMessage } from "./GroupChatFunc";
import { MdDone, MdDoneAll } from "react-icons/md";

const GroupChat = () => {
  const handle = useParams().id;
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [myInfo, setMyInfo] = useState({
    myId: "",
    myName: "",
  });
  const [newMessage, setNewMessage] = useState("");
  const [attachmentURL, setAttachmentURL] = useState("");
  const [attachmentType, setAttachmentType] = useState(null);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [groupInfo, setGroupInfo] = useState({});
  const [removedMember, setRemovedMember] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchGroupMessages = async () => {
      try {
        const res = await groupChatApi.getChat(handle);
        setMessages(res?.data?.groupChat);
        setGroupInfo(res?.data?.group);
        const infoObj = {
          myId: res?.data?.myId,
          myName: res?.data?.username,
        };
        socket.emit("join-room-group", { groupId: res.data.group._id });

        socket.emit("read-group-message", { groupId: res.data.group._id });
        setMyInfo(infoObj);
      } catch (error) {
        console.log("error", error);
        toast.error(error?.response?.data?.message);
      }
    };
    fetchGroupMessages();

    return () => {};
  }, [handle]);

  // for listening
  useEffect(() => {
    // if (!messages) return;
    socket.on("new-group-message", (data) => {
      console.log("New group message: ", data);

      newGroupMessage(data, setMessages);
      socket.emit("single-read-group-message", {
        groupId: groupInfo._id,
        messageId: data.message._id,
        senderId: data.message.senderId._id,
      }); // this is me that i have read the msg
    });

    socket.on("group-message-read", (data) => {
      const { unreadMessages, receiverId } = data;
      const newObj = messages.map((message) => {
        unreadMessages.map((unreadMessage) => {
          if (unreadMessage?._id.toString() === message?._id.toString()) {
            return {
              ...message,
              readBy: [...message?.readBy, receiverId],
            };
          }
        });
        return message;
      });

      setMessages(newObj);
    });

    socket.on("single-group-message-read", (data) => {
      const { messageId, receiverId } = data;
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if (message?._id?.toString() === messageId?.toString()) {
            return {
              ...message,
              readBy: [...(message?.readBy || []), receiverId],
            };
          }
          return message;
        })
      );
    });

    socket.on("new-group-member", (data) => {
      const { userId } = data;
      setGroupInfo((prev) => {
        return {
          ...prev,
          members: [...prev?.members, userId],
        };
      });
    });

    socket.on("left-group-member", (data) => {
      const { userId } = data;
      if (userId === myId) setRemovedMember(true);
      setGroupInfo((prev) => {
        return {
          ...prev,
          members: prev?.members.filter((member) => member !== userId),
        };
      });
    });

    socket.on("member-removed", (data) => {
      const { groupId, memberId, memberName } = data;
      setRemovedMember(true);
      setGroupInfo((prev) => {
        return {
          ...prev,
          members: prev?.members.filter((member) => member !== memberId),
        };
      });
    });

    return () => {
      socket.off("new-group-message");
      socket.off("group-message-delivered");
      socket.off("group-message-read");
      socket.off("new-group-member");
      socket.off("read-group-message");
      socket.off("left-group-member");
      socket.off("member-removed");
    };
  }, [socket, messages]);

  useEffect(() => {
    return () => {
      socket.emit("leave-room-group", { groupId: groupInfo?._id });
      socket.off("join-room-group");
    };
  }, [groupInfo._id, socket]);

  // for Joining and Leaving the roooom
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leave-room-group", { groupId: groupInfo?._id });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [groupInfo._id, socket]);

  // for handling the errors
  useEffect(() => {
    socket.on("read-group-message-error", (data) => {
      toast.error(data);
    });
  }, [socket]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMessage) return;
      const newMsg = {
        senderId: {
          _id: myInfo.myId,
          username: myInfo.myName,
          avatar: localStorage.getItem("avatar_url"),
        },
        createdAt: new Date(),
        isDeleted: false,
        readBy: [],
        deliveredTo: [],
        message: attachmentURL || newMessage,
        messageType: attachmentType || "text",
        isNotification: false,
      };

      socket.emit("new-group-message", {
        message: newMsg,
        groupId: groupInfo?._id,
      });

      setNewMessage("");
      setAttachmentOpen(false);
    },
    [newMessage]
  );
  return (
    <div
      className={`flex w-full flex-col h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Link onClick={() => navigate(-1)}>
            <FaArrowLeft className="cursor-pointer" />
          </Link>
          <Link to={`/group/${groupInfo?.handle}`}>
            <div className="flex items-center gap-2">
              <div>
                <img
                  src={groupInfo?.groupIcon}
                  className="w-12 h-12 rounded-full"
                  alt="Group Image"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold">{groupInfo?.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {groupInfo?.members?.length} members
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <FaUserPlus className="cursor-pointer" />
          <FaEllipsisV className="cursor-pointer" />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {messages?.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No messages yet.
          </p>
        ) : (
          messages?.map((msg, index) => {
            const prevDate = new Date(
              messages[index]?.createdAt
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            const nextDate =
              new Date(messages[index - 1]?.createdAt).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              ) || prevDate;

            const showDateSeparator = prevDate !== nextDate;

            return (
              <div key={msg?._id || msg?.tempId}>
                {/* Date separator */}
                {showDateSeparator && (
                  <div className="flex justify-center items-center p-2 my-2">
                    <h1
                      className={`text-sm text-gray-500 rounded-lg p-2 ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      {prevDate}
                    </h1>
                  </div>
                )}

                {/* Main message container */}
                <div
                  className={`flex gap-3 items-start ${
                    msg?.senderId?._id === myInfo.myId
                      ? "self-end flex-row-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  {!msg?.isNotification && (
                    <img
                      src={msg?.senderId?.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  )}

                  {/* Message content */}
                  {!msg?.isNotification ? (
                    <div
                      className={`flex flex-col space-y-1 ${
                        msg?.senderId?._id === myInfo.myId ? "items-end" : ""
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {msg?.senderId?.username}
                      </p>

                      {/* Message bubble */}
                      {msg?.messageType === "text" ? (
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg?.senderId?._id === myInfo.myId
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          {msg?.message}
                        </div>
                      ) : msg?.messageType === "image" ? (
                        <img src={msg?.message} alt="" />
                      ) : msg?.messageType === "video" ? (
                        <video controls>
                          <source src={msg?.message} type="video/mp4" />
                        </video>
                      ) : msg?.messageType === "audio" ? (
                        <audio controls>
                          <source src={msg?.message} type="audio/mpeg" />
                        </audio>
                      ) : msg?.messageType === "file" ? (
                        <a href={msg?.message} target="_blank" rel="noopener">
                          {msg?.message}
                        </a>
                      ) : null}

                      {/* Message status */}
                      {msg.senderId?._id === myInfo?.myId &&
                        msg?.readBy?.length === groupInfo?.members?.length && (
                          <MdDoneAll className="text-green-500" />
                        )}

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(msg?.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className={`w-full flex justify-center`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-400"
                        }`}
                      >
                        <div
                          className={`text-sm text-center ${
                            theme === "dark" ? "bg-gray-700" : "bg-gray-400"
                          }`}
                        >
                          {msg?.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      {groupInfo.members?.includes(myInfo.myId) ? (
        <footer className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 border-t">
          <CgAttachment
            className="text-2xl cursor-pointer mr-2"
            onClick={() => setAttachmentOpen(!attachmentOpen)}
          />
          <form className="flex flex-1" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </form>
        </footer>
      ) : (
        <div
          className={`flex items-center px-4 py-3 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } border-t`}
        >
          <p
            className={`${
              theme === "dark" ? "text-white" : "text-gray-900"
            } text-center `}
          >
            You are not a member of this group
          </p>
        </div>
      )}

      {/* Attachment Modal */}
      {attachmentOpen && (
        <div
          className={`fixed z-50 flex flex-col items-center p-4 border rounded-lg shadow-lg ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white"
          }`}
          style={{
            bottom: "70px",
            left: "16px",
          }}
        >
          <h4 className="font-semibold mb-2">Select File Type</h4>
          <div className="flex flex-col gap-2">
            <button
              className={`px-4 py-2 rounded-lg ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              onClick={() => setAttachmentType("image")}
            >
              Image
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              onClick={() => setAttachmentType("video")}
            >
              Video
            </button>
          </div>
          <button
            className={`mt-2 px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => setAttachmentOpen(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* URL Input Modal */}
      {attachmentType && (
        <div
          className={`fixed z-50 flex flex-col items-center p-4 border rounded-lg shadow-lg ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white"
          }`}
          style={{
            bottom: "70px", // Position just above the attachment icon
            left: "16px", // Aligned slightly to the left
          }}
        >
          <h4 className="font-semibold mb-2">
            Enter{" "}
            {attachmentType.charAt(0).toUpperCase() + attachmentType.slice(1)}{" "}
            URL
          </h4>
          <input
            type="text"
            className={`w-full p-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-100 border-gray-300 text-gray-900"
            }`}
            placeholder={`Paste ${attachmentType} link here...`}
            value={attachmentURL}
            onChange={(e) => {
              console.log(e.target.value);
              setAttachmentURL(e.target.value);
            }}
          />
          <div className="flex gap-2">
            <button
              className={`mt-2 px-4 py-2 rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => setAttachmentType(null)}
            >
              Cancel
            </button>
            <button
              className={`mt-2 px-4 py-2 rounded-lg ${
                theme === "dark"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              onClick={(e) => {
                setAttachmentOpen(false);
                handleSendMessage(e);
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
