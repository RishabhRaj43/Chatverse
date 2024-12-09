import React, { useEffect, useState } from "react";
import userChatApi from "../../../../API/Chat/User/UserChatApi";
import { toast } from "react-hot-toast";
import useTheme from "../../../../Context/useTheme";
import { Link } from "react-router-dom";
import contactApi from "../../../../API/User/Contact/ContactApi";
import useSocket from "../../../../Context/UseSocket";

const IndvidualChat = () => {
  const [chats, setChats] = useState([]);
  const [myId, setMyId] = useState(null);
  const { socket } = useSocket();
  const [initialChats, setInitialChats] = useState([]);
  const { theme } = useTheme();
  const [blockedContacts, setBlockedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useState({
    email: "",
    phoneNumber: "",
  });
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.emit("request-online-users");
    const fetchChats = async () => {
      try {
        const res = await userChatApi.getChats();
        console.log("Chats: ", res.data.userChats);

        setMyId(res.data.myId);
        setChats(res.data.userChats);
        setInitialChats(res.data.userChats);
      } catch (error) {
        console.log("error", error);
        toast.error(error?.response?.data?.message);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    socket.emit("request-online-users");
    socket.on("online-users", (users) => {
      
      setOnlineUsers(Array.from(users));
    });
    const handleNewMessage = async (message) => {
      const senderId = message?.newMessage?.senderId?.toString();
      const existingChat = chats.find(
        (chat) => chat?.otherUser?.id.toString() === senderId
      );

      if (existingChat) {
        const updatedChats = chats.map((chat) => {
          if (chat?.otherUser?.id.toString() === senderId) {
            console.log("New User: ", chat);

            return {
              ...chat,
              latestMessage: message.newMessage.message,
              createdAt: message.newMessage.createdAt,
              isDeleted: message.newMessage.isDeleted,
              newMessagesCount: chat.newMessagesCount + message.newMessageCount,
            };
          }
          return chat;
        });
        setChats(updatedChats);
      } else {
        const fetchUserDetails = async (senderId) => {
          try {
            const res = await contactApi.searchContact({ id: senderId });
            const userDetails = res.data.user;
            const newChat = {
              latestMessage: message.newMessage.message,
              isDeleted: message.newMessage.isDeleted,
              otherUser: {
                id: senderId,
                avatar: userDetails.avatar,
                username: userDetails.username,
              },
              createdAt: message.newMessage.createdAt,
              newMessagesCount: message.newMessageCount,
            };
            setChats((prevChats) => [...prevChats, newChat]);
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
        };
        fetchUserDetails(senderId);
      }
    };

    socket.on("new-user-message", handleNewMessage);

    return () => {
      socket.off("online-users");
      socket.off("new-user-message", handleNewMessage);
    };
  }, [socket, chats]);

  const searchContact = async (e) => {
    e.preventDefault();

    if (!searchParams.email && !searchParams.phoneNumber) {
      return toast.error("All fields are required");
    }

    if (
      !searchParams.email.includes("@") ||
      !searchParams.email.includes(".")
    ) {
      return toast.error("Please enter a valid email address");
    }

    if (searchParams.phoneNumber && searchParams.phoneNumber.length !== 10) {
      return toast.error("Please enter a valid phone number");
    }

    try {
      const res = await contactApi.searchContact(searchParams);

      const newContacts = res.data.contactUser || [];

      const updatedChats = newContacts.map((contact) => {
        const existingChat = initialChats.find(
          (chat) =>
            chat?.otherUser?.email === contact.email &&
            chat?.otherUser?.phoneNumber === contact.phoneNumber
        );

        if (existingChat) {
          return existingChat;
        } else {
          return {
            latestMessage: "",
            otherUser: { ...contact, id: contact._id },
            createdAt: null,
          };
        }
      });

      setChats(updatedChats);
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleSearchInputChange = (value) => {
    value = value.trim();
    if (value.length > 0) {
      if (isNaN(value)) {
        setSearchParams({ email: value, phoneNumber: "" });
      } else if (!isNaN(value)) {
        setSearchParams({ email: "", phoneNumber: value });
      }
    } else {
      setSearchParams({ email: "", phoneNumber: "" });
      setChats(initialChats);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearchInputChange(value);
  };
  const handleChatClick = (OtherUserId) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.otherUser.id === OtherUserId) {
          const newObj = {
            ...chat,
            newMessagesCount: 0,
          };
          return newObj;
        }
        return chat;
      })
    );
  };

  return (
    <div
      className={`px-4 py-6 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-800"
      } min-h-screen`}
    >
      <h2 className="text-3xl font-semibold mb-6">Chats</h2>
      {/* Search Bar */}
      <form className="mb-6 flex gap-2" onSubmit={searchContact}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search by email or phone number"
          className={`w-full px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700 placeholder-gray-500"
              : "bg-white text-gray-800 border-gray-300 placeholder-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <button className="ml-2 px-4 py-2 rounded-lg bg-indigo-500 text-white">
          Search
        </button>
      </form>
      {/* Chats List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {chats
          ?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
          .map((chat, index) => (
            // console.log("chat", chat),
            <Link
              to={`/chat/${chat?.otherUser?.id}`}
              onClick={() => handleChatClick(chat?.otherUser?.id)}
              key={index}
            >
              <div
                className={`relative rounded-lg shadow-md p-4 flex items-center space-x-4 transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <div className="relative">
                  <img
                    src={chat?.otherUser?.avatar}
                    alt={chat?.otherUser?.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${
                      theme === "dark" ? "border-gray-800" : "border-white"
                    } ${
                      onlineUsers.includes(chat?.otherUser?.id)
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  ></span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {chat?.otherUser?.username}
                    </h3>
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {chat?.createdAt
                        ? new Date(chat?.createdAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {myId === chat?.senderId && <span>You: </span>}

                      {!chat?.isDeleted ? (
                        <span>
                          {chat?.latestMessage
                            ? chat.latestMessage.length > 15
                              ? chat.latestMessage.slice(0, 15) + "..." // For longer messages, slice at 15
                              : chat.latestMessage.length > 10
                              ? chat.latestMessage.slice(0, 10) + "..." // For medium messages, slice at 10
                              : chat.latestMessage.length > 8
                              ? chat.latestMessage.slice(0, 8) + "..." // For shorter messages, slice at 8
                              : chat.latestMessage
                            : "No message"}
                        </span>
                      ) : (
                        <span>This message has been deleted</span>
                      )}
                    </p>

                    {/* New Message Count */}
                    {myId !== chat?.senderId && chat?.newMessagesCount > 0 && (
                      <span
                        className={`top-0 right-0 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full shadow-lg ${
                          theme === "dark"
                            ? "border-2 border-gray-800"
                            : "border-2 border-gray-100"
                        }`}
                      >
                        {chat?.newMessagesCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default IndvidualChat;
