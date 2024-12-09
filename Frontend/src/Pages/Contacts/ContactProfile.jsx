import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import contactApi from "../../API/User/Contact/ContactApi";
import { FaLink, FaTrashAlt, FaBan, FaSave } from "react-icons/fa";
import useTheme from "../../Context/useTheme";
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import toast from "react-hot-toast";
import useSocket from "../../Context/UseSocket";

const ContactProfile = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const [contact, setContact] = useState(null);
  const { theme } = useTheme();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isContactSaved, setIsContactSaved] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await contactApi.getOne(id);
        setContact(res.data.user);
        setIsBlocked(res.data.isBlocked);
        setIsContactSaved(res.data.isContactSaved);
      } catch (error) {
        console.error("Error fetching contact:", error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    socket.emit("request-online-users");
    socket.on("online-users", (data) => {
      setOnlineUsers(Array.from(data));
    });
  }, [socket]);

  const deleteContact = async () => {
    try {
      let res;
      isContactSaved
        ? (res = await contactApi.delete(contact?._id))
        : (res = await contactApi.save({ phoneNumber: contact?.phoneNumber }));
      setIsContactSaved(!isContactSaved);
      toast.success(res?.data?.message);
    } catch (error) {
      console.log("Error in deleteContact", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const blockContact = async () => {
    try {
      let res;
      isBlocked
        ? ((res = await contactApi.unblockContact(id)),
          socket.emit("unblock-contact", id))
        : ((res = await contactApi.blockContact(id)),
          socket.emit("block-contact", id));
      setIsBlocked(!isBlocked);
      toast.success(res?.data?.message);
    } catch (error) {
      console.log("Error in blockContact", error);
      toast.error(error?.response?.data?.message);
    }
  };

  if (!contact) return <div>Loading...</div>;

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-800"
      } p-6`}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-6 mb-8"
        >
          <div className="relative">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              src={contact?.avatar}
              alt={contact?.username}
              className="w-60 h-60 rounded-full object-cover"
            />

            {onlineUsers.includes(contact?._id) ? (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-green-500 text-white text-sm px-2 py-1 rounded-lg shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full"></span>
                <span>Online</span>
              </div>
            ) : (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-gray-500 text-white text-sm px-2 py-1 rounded-lg shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full"></span>
                <span>Offline</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-semibold"
            >
              {contact?.username}
            </motion.h1>
            <motion.p
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xl text-gray-500"
            >
              {contact?.bio || "No bio available"}
            </motion.p>
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col mt-4"
            >
              <div className=" flex items-center gap-3">
                <span className="font-medium">Email:</span>
                <span>{contact?.email}</span>
              </div>
              <div className=" flex items-center gap-3">
                <span className="font-medium">Phone Number:</span>
                <span>{contact?.phoneNumber}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4"
            >
              <span className="font-medium">Social Links:</span>
              <div className="flex gap-4">
                {contact?.socialLinks?.map((link, index) => {
                  let Icon;
                  switch (link.platform.toLowerCase()) {
                    case "github":
                      Icon = FaGithub;
                      break;
                    case "twitter":
                      Icon = FaTwitter;
                      break;
                    case "linkedin":
                      Icon = FaLinkedin;
                      break;
                    case "instagram":
                      Icon = FaInstagram;
                      break;
                    default:
                      Icon = FaLink;
                  }

                  return (
                    <Link
                      key={index}
                      to={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <Icon className="text-2xl" />{" "}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex space-x-4"
        >
          {/* Block Contact Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={blockContact}
            className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 ${
              isBlocked
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            <FaBan
              className={`text-lg ${
                isBlocked ? "text-green-200" : "text-red-200"
              }`}
            />
            <span>{isBlocked ? "Unblock" : "Block"} Contact</span>
          </motion.button>

          {/* Delete Contact Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={deleteContact}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
              isContactSaved
                ? `${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  } hover:bg-red-500`
                : `${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  } hover:bg-green-500`
            } shadow-md `}
          >
            {/* Icon logic */}
            {isContactSaved ? (
              <FaTrashAlt className="transition-transform rotate-0" />
            ) : (
              <FaSave className="transition-transform rotate-0" />
            )}
            <span className="font-semibold">
              {isContactSaved ? "Delete" : "Save"} Contact
            </span>
          </motion.button>
        </motion.div>

        {/* Tabs Section (e.g., Bio, Contact Info) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Bio Tab */}
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            } p-6 rounded-lg shadow-lg`}
          >
            <motion.h2
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-semibold mb-4"
            >
              Bio
            </motion.h2>
            <motion.p
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-md"
            >
              {contact.bio || "No bio available."}
            </motion.p>
          </div>

          {/* Contact Info Tab */}
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            } p-6 rounded-lg shadow-lg`}
          >
            <motion.h2
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-semibold mb-4"
            >
              Contact Info
            </motion.h2>
            <motion.p
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-md"
            >
              Email:
              <a
                className="text-blue-500 ml-2 hover:underline"
                href={`mailto:${contact.email}`}
              >
                {contact.email}
              </a>
            </motion.p>
            <motion.p
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-md"
            >
              Phone: {contact.phoneNumber}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactProfile;
