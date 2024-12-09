import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useProfile from "../../Context/useProfile";
import { FaMoon, FaSun } from "react-icons/fa";
import useTheme from "../../Context/useTheme";
import useSocket from "../../Context/UseSocket";

const Navbar = () => {
  const { socket } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const { user, avatar, logout } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropDown, setProfileDropDown] = useState(false);

  const handleDropdownToggle = (event) => {
    event.stopPropagation();
    setProfileDropDown(false);
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  const handleProfileDropdownClose = () => {
    setProfileDropDown(false);
  };

  return (
    <motion.nav
      className={`${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-indigo-700 text-white"
      } shadow-md`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          user ? "py-2" : "py-4"
        } flex items-center justify-between`}
      >
        <Link to="/" className="flex items-center space-x-2">
          <motion.span className="text-4xl font-bold flex items-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Chat
            </motion.span>
            <motion.span
              className="text-yellow-300 ml-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Verse
            </motion.span>
          </motion.span>
        </Link>
        <motion.div className="flex items-center space-x-6">
          <Link to="/" className="text-lg hover:text-gray-300">
            Home
          </Link>
          <div className="relative">
            <motion.button
              className="text-lg hover:text-gray-300 dropdown-btn"
              onClick={handleDropdownToggle}
              transition={{ duration: 0.3 }}
            >
              Chat Section
            </motion.button>
            {dropdownOpen && (
              <motion.div
                className="absolute bg-white text-black shadow-lg rounded-md mt-2 dropdown-menu z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ top: "100%", left: 0 }}
              >
                <Link
                  to="/chat/group"
                  className="block px-4 py-2 hover:rounded-md hover:bg-gray-100"
                  onClick={handleDropdownClose}
                >
                  Group Chat
                </Link>
                <Link
                  to="/chat/individual"
                  className="block px-4 py-2 hover:rounded-md hover:bg-gray-100"
                  onClick={handleDropdownClose}
                >
                  Individual Chat
                </Link>
              </motion.div>
            )}
          </div>
          <Link to="/contacts" className="text-lg hover:text-gray-300">
            Contacts
          </Link>
          <motion.button
            className="ml-6 text-lg hover:text-gray-300"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
          >
            {theme === "dark" ? <FaSun size={24} /> : <FaMoon size={24} />}
          </motion.button>
          {user ? (
            <motion.div
              className="flex items-center space-x-2 cursor-pointer relative avatar-btn"
              transition={{ duration: 0.3 }}
            >
              <img
                src={avatar || "/path/to/default-avatar.png"}
                alt="User Avatar"
                className="w-12 h-12 rounded-full"
                onClick={() => {
                  setDropdownOpen(false);
                  setProfileDropDown(!profileDropDown);
                }}
              />
              {profileDropDown && (
                <motion.div
                  className="absolute bg-white text-black shadow-lg rounded-md mt-2 profile-dropdown-menu z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    top: "100%",
                    left: "0",
                    right: "auto",
                    maxWidth: "250px",
                    width: "auto",
                    transform: "translateX(-50%)",
                  }}
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:rounded-md hover:bg-gray-100"
                    onClick={handleProfileDropdownClose}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/auth/login"
                    className="block px-4 py-2 hover:rounded-md hover:bg-gray-100"
                    onClick={() => {
                      logout(socket);
                      handleProfileDropdownClose();
                    }}
                  >
                    Logout
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="inline-block"
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <Link
                to="/auth/login"
                className="text-lg font-semibold hover:text-yellow-500 transition-all duration-300 bg-indigo-600  py-2 px-6 rounded-lg shadow-none"
              >
                Login
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
