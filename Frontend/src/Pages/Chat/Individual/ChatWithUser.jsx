import React, { useCallback, useEffect, useRef, useState } from "react";
import useTheme from "../../../Context/useTheme";
import { Link, useFetcher, useNavigate, useParams } from "react-router-dom";
import contactApi from "../../../API/User/Contact/ContactApi";
import toast from "react-hot-toast";
import userChatApi from "../../../API/Chat/User/UserChatApi";
import { MdDone, MdDoneAll } from "react-icons/md";
import useSocket from "../../../Context/UseSocket";
import useProfile from "../../../Context/useProfile";
import { FaArrowLeftLong } from "react-icons/fa6";
import { CgAttachment } from "react-icons/cg";

const ChatWithUser = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const { socket } = useSocket();
  const { avatar } = useProfile();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [userData, setUserData] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [myId, setMyId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [haveYouBlocked, setHaveYouBlocked] = useState(false);
  const [attachmentType, setAttachmentType] = useState(null);
  const [attachmentURL, setAttachmentURL] = useState("");
  const [attachmentOpen, setAttachmentOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  if (!socket) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await userChatApi.getChat(id);
        setMessages(res?.data?.userChats);
      } catch (error) {
        console.log("error", error);
        toast.error(error?.response?.data?.message);
      }
    };
    fetchChats();
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await contactApi.searchContact({ id });
        setMyId(res.data.currUserId);
        setUserData(res.data.user);
        setHaveYouBlocked(res.data.haveYouBlocked);
        if (res?.data?.user?.blocked?.includes(res.data.currUserId))
          setIsBlocked(true);
        socket.emit("am-i-blocked", {
          myId: res?.data?.currUserId,
          userId: id,
        });

        setActiveChat(res.data.user._id);

        socket.emit("read-messages", {
          senderId: id,
          receiverId: res.data.currUserId,
        });
      } catch (error) {
        console.log("error", error);
        toast.error(error?.response?.data?.message);
      }
    };
    fetchUser();

    socket.emit("request-online-users");

    return () => {
      socket.off("refresh-user-chats");
    };
  }, [id]);

  useEffect(() => {
    if (!myId || !userData || !socket) return;
    socket.emit("read-messages", {
      senderId: id,
      receiverId: userData,
    });
    socket.emit("request-online-users");
    socket.emit("am-i-blocked", {
      myId: myId,
      userId: id,
    });

    return () => {
      socket.off("refresh-user-chats");
    };
  }, [socket, userData, myId]);

  useEffect(() => {
    socket.emit("request-online-users");
    socket.on("online-users", (data) => {
      setOnlineUsers(Array.from(data));
    });

    !isBlocked &&
      socket.emit("read-messages", { senderId: id, receiverId: myId });

    return () => {
      socket.off("online-users");
      socket.off("read-messages");
    };
  }, [socket, myId, id]);

  useEffect(() => {
    if (!myId) return;

    socket.on("am-i-blocked", (data) => {
      console.log("Am I Blocked: ", data);
      setIsBlocked(data);
    });
    const handleUndeliveredMessagesUpdated = (userId) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if (
            message.receiverId.toString() === userId.toString() &&
            !message.isDelivered
          ) {
            return {
              ...message,
              isDelivered: true,
            };
          }
          return message;
        })
      );
    };

    !isBlocked &&
      socket.on(
        "undelivered-messages-updated",
        handleUndeliveredMessagesUpdated
      );

    const handleNewMessage = (incomingMessage) => {
      if (
        incomingMessage?.newMessage?.senderId?.toString() === id?.toString() &&
        incomingMessage?.newMessage?.receiverId?.toString() === myId?.toString()
      ) {
        setMessages((inprevMessages) => [
          ...inprevMessages,
          incomingMessage.newMessage,
        ]);
      }

      if (activeChat == incomingMessage?.newMessage?.senderId) {
        socket.emit("read-messages", {
          senderId: id,
          receiverId: myId,
        });
      }
    };

    !isBlocked && socket.on("new-user-message", handleNewMessage);

    !isBlocked &&
      socket.on("message-sent", ({ tempId, newId, isDelivered }) => {
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            if (message.tempId === tempId) {
              return { ...message, _id: newId, isDelivered: isDelivered };
            }
            return message;
          });
        });
      });

    !isBlocked &&
      socket.on("message-deleted", (messageId) => {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message._id === messageId.id
              ? { ...message, isDeleted: true }
              : message
          )
        );
      });

    !isBlocked &&
      socket.on("messages-read", (data) => {
        const messageIds = data.messageIds;
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            messageIds.includes(message._id)
              ? { ...message, isRead: true }
              : message
          )
        );
      });

    return () => {
      socket.off("new-user-message", handleNewMessage);
      socket.off("message-sent");
      socket.off("message-deleted");
      socket.off("undelivered-messages-updated");
      socket.off("am-i-blocked");
      socket.off("messages-read");
      socket.off("read-messages");
    };
  }, [socket, myId, id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleRightClick = useCallback((e, message) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    const windowWidth = window.innerWidth;
    const isSpaceOnRight = x + 200 <= windowWidth;

    setSelectedMessage(message);
    setContextMenu({
      x: isSpaceOnRight ? x : x - 200,
      y,
      message,
    });
  }, []);

  const handleDeleteMessage = useCallback(() => {
    if (selectedMessage.senderId !== myId) {
      return toast.error("You can only delete your own messages");
    }

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id === selectedMessage._id
          ? { ...message, isDeleted: true }
          : message
      )
    );

    socket.emit("delete-message", {
      msgId: selectedMessage._id,
      receiverId: userData._id,
    });
    setContextMenu(null);
    toast.success("Message deleted");
  }, [selectedMessage, myId, socket]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const sendMessage = useCallback(
    async (e, senderId, receiverId) => {
      e.preventDefault();
      console.log("Attachmen Url: ", attachmentURL);
      if (!attachmentURL && !newMessage) {
        return toast.error("Please enter a message or attach a file");
      }

      if (attachmentURL && newMessage) {
        return toast.error("You can only attach a file or enter a message");
      }

      const videoImageRegex =
        /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg|webp|mp4|avi|mov|mkv|webm|flv|wmv))/i;

      if (attachmentURL && !videoImageRegex.test(attachmentURL)) {
        return toast.error("Please enter a valid URL");
      }

      const tempId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const messageInfo = {
        tempId,
        senderId,
        receiverId,
        avatar,
        message: attachmentURL || newMessage,
        isDeleted: false,
        createdAt: Date.now(),
        messageType: attachmentType || "text",
        isDelivered: !isBlocked && onlineUsers?.includes(receiverId),
      };

      setMessages((prevMessages) => [...prevMessages, messageInfo]);

      setNewMessage("");
      setAttachmentURL(null);
      setAttachmentType(null);
      setAttachmentOpen(false);
      socket.emit("send-user-message", messageInfo);
    },
    [newMessage, avatar, onlineUsers, socket, attachmentURL, attachmentType]
  );

  return (
    <div
      className={`flex w-full flex-col h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* User Profile Section */}
      <div className="flex items-center gap-4 px-4 py-2 border-b">
        <div className="cursor-pointer" onClick={() => navigate(-1)}>
          <FaArrowLeftLong size={24} />
        </div>
        <Link to={`/profile/${id}`} className="flex items-center gap-4">
          <div className="relative">
            <img
              src={userData?.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                onlineUsers?.includes(id) ? "bg-green-500" : "bg-gray-400"
              } ${theme === "dark" ? "border-gray-900" : "border-white"}`}
            ></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {userData?.username || "User"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {onlineUsers?.includes(id) ? "Online" : "Offline"}
            </p>
          </div>
        </Link>
      </div>

      {/* Messages Section */}
      <div
        className={`flex-1 flex flex-col overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 w-full`}
      >
        {messages?.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No Messages Yet
          </div>
        ) : (
          <div>
            {messages?.map((message, index) => {
              let prevDate = new Date(
                messages[index].createdAt
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              let nextDate =
                new Date(messages[index - 1]?.createdAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                ) || prevDate;
              return (
                <div key={index} className="flex flex-col">
                  {prevDate !== nextDate && (
                    <div
                      className={`flex justify-center items-center p-2 my-2`}
                    >
                      <h1
                        className={`text-sm text-gray-500 rounded-lg p-2
                      ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
                      >
                        {prevDate}
                      </h1>
                    </div>
                  )}

                  <div
                    className={`max-w-xs mb-2 flex flex-col md:max-w-md p-3 rounded-lg break-words ${
                      message?.senderId === myId
                        ? theme === "dark"
                          ? "bg-green-300 text-black self-end"
                          : "bg-green-800 text-white self-end"
                        : theme === "dark"
                        ? "bg-gray-800 text-white self-start"
                        : "bg-gray-100 text-gray-900 self-start"
                    }`}
                    onContextMenu={(e) => handleRightClick(e, message)}
                  >
                    {message?.isDeleted ? (
                      <p
                        className={`${
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        } text-sm text-center`}
                      >
                        This message was deleted.
                      </p>
                    ) : (
                      <div className="flex gap-2 flex-col">
                        {message?.messageType === "text" ? (
                          <p className="text-sm">{message?.message}</p>
                        ) : message?.messageType === "image" ? (
                          <img
                            src={message?.message}
                            alt="Attachment"
                            className="w-full h-full object-cover"
                          />
                        ) : message?.messageType === "video" ? (
                          <video controls>
                            <source src={message?.message} type="video/mp4" />
                          </video>
                        ) : message?.messageType === "audio" ? (
                          <audio controls>
                            <source src={message?.message} type="audio/mpeg" />
                          </audio>
                        ) : (
                          <p className="text-sm">{message?.message}</p>
                        )}
                        <div className="text-xs flex gap-2 items-center">
                          <div>
                            {message?.createdAt &&
                              new Date(message?.createdAt).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                          </div>
                          <div>
                            {message?.senderId === myId && (
                              <>
                                {message?.isRead ? (
                                  <MdDoneAll
                                    size={20}
                                    className={`self-end ${
                                      theme === "dark"
                                        ? "text-cyan-600"
                                        : "text-cyan-600"
                                    }`}
                                  />
                                ) : message?.isDelivered ? (
                                  (console.log(
                                    "Message Delivered: ",
                                    message?.isDelivered
                                  ),
                                  (
                                    <MdDoneAll
                                      size={20}
                                      className={`self-end ${
                                        theme === "dark"
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    />
                                  ))
                                ) : isBlocked ? (
                                  <MdDone
                                    size={20}
                                    className={`self-end ${
                                      theme === "dark"
                                        ? "text-gray-200"
                                        : "text-gray-600"
                                    }`}
                                  />
                                ) : (
                                  <MdDone
                                    size={20}
                                    className={`self-end ${
                                      theme === "dark"
                                        ? "text-gray-200"
                                        : "text-gray-600"
                                    }`}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {contextMenu && (
          <ul
            className="absolute bg-white dark:bg-gray-800 text-black dark:text-white border rounded-lg shadow-lg"
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          >
            <li
              className="px-4 py-2 cursor-pointer rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={handleDeleteMessage}
            >
              Delete Message
            </li>
          </ul>
        )}
      </div>

      {!haveYouBlocked ? (
        <form
          onSubmit={(e) => {
            sendMessage(e, myId, userData?._id);
          }}
          className="flex items-center p-4 border-t"
        >
          <CgAttachment
            size={25}
            onClick={() => setAttachmentOpen(true)}
            className={`mr-2 cursor-pointer ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } `}
          />
          <input
            type="text"
            className={`flex-1 p-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-gray-100 border-gray-300 text-gray-900"
            }`}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Send
          </button>
        </form>
      ) : (
        <div>
          <p className="text-center text-2xl py-3 text-red-500">
            You have blocked this user
          </p>
        </div>
      )}
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
                sendMessage(e, myId, userData?._id);
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

export default ChatWithUser;
