import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useTheme from "../../../../Context/useTheme";
import useSocket from "../../../../Context/UseSocket";
import contactApi from "../../../../API/User/Contact/ContactApi";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const SearchContactToAddMember = ({
  onlineUsers,
  onAddMember,
  setAddMemberModal,
  groupId,
}) => {
  const { theme } = useTheme();
  const { socket } = useSocket();

  const [searchType, setSearchType] = useState("email");
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [initialContacts, setInitialContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await contactApi.get(); // Assuming API call
        const fetchedContacts = res.data.contacts || [];
        setContacts(fetchedContacts);
        console.log("Fetched contacts:", fetchedContacts);

        setInitialContacts(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load contacts"
        );
      }
    };

    fetchContacts();
  }, []);

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (searchType === "email" && term.length > 0) {
      setContacts(
        initialContacts.filter((contact) =>
          contact.email.toLowerCase().includes(term.toLowerCase())
        )
      );
    } else if (searchType === "phoneNumber" && term.length > 0) {
      setContacts(
        initialContacts.filter((contact) => contact.phoneNumber.includes(term))
      );
    } else if (term.length === 0) {
      setContacts(initialContacts);
    }
  };

  const handleAddMember = (userId, username) => {
    socket.emit("join-group", {
      groupId,
      userId,
      message: `${username} has been added to the group`,
      isPrivateAllowed: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === "dark"
          ? "bg-gray-900 bg-opacity-70"
          : "bg-gray-100 bg-opacity-70"
      }`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-lg p-6 rounded-lg shadow-lg ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-semibold mb-4">Add Member</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder={`Search by ${searchType}`}
            value={searchTerm}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-200 border-gray-300"
            }`}
          />
        </div>

        <div className="h-64 overflow-y-auto space-y-3">
          {contacts.map((contact) => (
            <motion.div
              key={contact._id}
              className={`flex items-center justify-between p-4 rounded-lg hover:shadow-md ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 "
                  : "bg-gray-100"
              }`}
            >
              <Link to={`/profile/${contact._id}`}>
                <div className="flex items-center gap-3">
                  <img
                    src={contact.avatar || "/default-avatar.png"}
                    alt={contact.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{contact.username}</h3>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                    <p className="text-sm text-gray-500">
                      {contact.phoneNumber}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleAddMember(contact._id, contact.username)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  theme === "dark"
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                }`}
              >
                Add Member
              </button>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => setAddMemberModal(false)}
          className={`mt-4 px-4 py-2 w-full text-sm font-medium rounded-lg ${
            theme === "dark"
              ? "bg-red-600 text-white hover:bg-red-500"
              : "bg-red-500 text-white hover:bg-red-400"
          }`}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SearchContactToAddMember;
