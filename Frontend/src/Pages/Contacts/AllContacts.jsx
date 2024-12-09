import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import contactApi from "../../API/User/Contact/ContactApi";
import useTheme from "../../Context/useTheme";
import useSocket from "../../Context/UseSocket";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import CreateContactModal from "../../Components/UI/CreateContactModal";

const AllContacts = () => {
  const { theme } = useTheme();
  const { socket } = useSocket();
  
  const [contacts, setContacts] = useState([]);
  const [initialContacts, setInitialContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("email");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await contactApi.get();
        setContacts(res.data.contacts || []);
        setInitialContacts(res.data.contacts || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load contacts"
        );
      }
    };

    fetchContacts();

    socket.emit("request-online-users");
    socket.on("online-users", (users) => {
      setOnlineUsers(Array.from(users));
    });

    return () => {
      socket.off("online-users");
    };
  }, [socket]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (searchType === "email" && e.target.value.length > 0) {
      return setContacts(
        contacts.filter((contact) =>
          contact.email.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    } else if (searchType === "phoneNumber" && e.target.value.length > 0) {
      return setContacts(
        contacts.filter((contact) =>
          contact.phoneNumber.includes(e.target.value)
        )
      );
    }
    if (e.target.value.length === 0) setContacts(initialContacts);
  };

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div
      className={`px-4 py-6 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-800"
      } min-h-screen`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold mb-6">Contacts</h2>
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow:
              theme === "dark"
                ? "0px 4px 15px rgba(93, 33, 208, 1)"
                : "0px 4px 15px rgba(255, 105, 180, 0.5)",
          }}
          whileTap={{
            scale: 1,
            boxShadow: "none",
          }}
          onClick={handleModalToggle}
          className={`px-6 mb-6 py-3 rounded-full text-white font-semibold ${
            theme === "dark"
              ? "bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 hover:from-indigo-700 hover:via-purple-600 hover:to-pink-600 "
              : "bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 hover:from-indigo-400 hover:via-purple-300 hover:to-pink-300 "
          }`}
        >
          <span
            className={`flex ${
              theme === "dark" ? "text-white" : "text-black"
            } justify-around items-center gap-2`}
          >
            <span className="text-lg">Create Contact</span>
            <FaPlus />
          </span>
        </motion.button>
      </div>

      <div className="mb-6 flex gap-2">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
          <option value="email">Search by Email</option>
          <option value="phoneNumber">Search by Phone Number</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={
            searchType === "email"
              ? "Enter email address"
              : "Enter phone number"
          }
          className={`w-full px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700 placeholder-gray-500"
              : "bg-white text-gray-800 border-gray-300 placeholder-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts && contacts.length > 0 ? (
          contacts.map((contact) => (
            // console.log("Contact: ",contact),
            <div
              className={`relative rounded-lg shadow-md p-4 flex items-center space-x-4 transition-all ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-100"
              }`}
              key={contact?._id}
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${
                    theme === "dark" ? "border-gray-800" : "border-white"
                  } ${
                    onlineUsers.includes(contact._id)
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                ></span>
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3
                    className={`text-md font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {contact.username}
                  </h3>
                  <h3
                    className={`text-md font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {contact.email}
                  </h3>
                  <h3
                    className={`text-md font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {contact.phoneNumber}
                  </h3>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {onlineUsers.includes(contact._id) ? "Online" : "Offline"}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/chat/${contact._id}`}
                    className={`px-4 py-2 rounded-lg flex justify-center items-center gap-2 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 hover:from-indigo-700 hover:via-purple-600 hover:to-pink-600"
                        : "bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 hover:from-indigo-400 hover:via-purple-300 hover:to-pink-300"
                    }`}
                  >
                    <span className="text-lg">Chat</span>
                    <FaArrowRight />
                  </Link>
                  <Link
                    to={`/profile/${contact._id}`}
                    className={`px-4 py-2 rounded-lg flex justify-center items-center gap-2 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-green-600 via-teal-500 to-emerald-400 hover:from-green-500 hover:via-teal-400 hover:to-emerald-300"
                        : "bg-gradient-to-r from-green-500 via-teal-400 to-emerald-300 hover:from-green-400 hover:via-teal-300 hover:to-emerald-200"
                    }`}
                  >
                    <span className="text-lg">Info</span>
                    <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3 text-center ${
              theme === "dark"
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-black"
            } p-6 rounded-lg shadow-md`}
          >
            <p className="text-3xl font-bold">No contacts found.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateContactModal
          setContacts={setContacts}
          setModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default AllContacts;
