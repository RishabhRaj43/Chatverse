import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaCommentDots, FaShieldAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <div className="relative w-full h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage:
              "url('https://source.unsplash.com/1600x900/?nature,water')",
          }}
        ></div>

        <div className="flex justify-center items-center w-full h-full absolute top-0 left-0 z-10">
          <div className="text-center text-white px-4 sm:px-6 md:px-8 lg:px-10">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Welcome to Chat
              <span className="text-yellow-500">Verse</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              The ultimate platform for seamless communication, connecting you
              with friends and colleagues.
            </motion.p>
            <Link to="chat/individual">
              <motion.button
                className="inline-block px-8 py-3 bg-yellow-500 text-black font-semibold rounded-lg text-lg hover:bg-yellow-400 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4 }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="absolute inset-0 w-full h-full bg-black opacity-40"></div>
      </div>

      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-extrabold text-gray-900 mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            About ChatVerse
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 sm:px-10 md:px-24 lg:px-48 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            ChatVerse is designed to make communication simple and enjoyable.
            Whether it's a one-on-one chat or a group conversation, ChatVerse is
            your go-to platform for staying connected with those who matter
            most.
          </motion.p>
          <motion.div
            className="inline-block px-8 py-3 cursor-pointer bg-indigo-700 text-white font-semibold rounded-lg text-lg hover:bg-indigo-600 transition-all duration-300"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() =>
              document
                .getElementById("features")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Learn More
          </motion.div>
        </div>
      </div>

      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-extrabold text-gray-900 mb-12"
            initial={{ opacity: 0, y: -50 }}
            id="features"
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
            <motion.div
              className="bg-white shadow-lg rounded-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex flex-col items-center">
                <FaUsers className="text-4xl text-indigo-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Group Chats</h3>
              </div>
              <p className="text-gray-600">
                Connect with multiple people at once in group conversations,
                share ideas, and collaborate in real-time.
              </p>
            </motion.div>
            <motion.div
              className="bg-white shadow-lg rounded-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              <div className="flex flex-col items-center">
                <FaCommentDots className="text-4xl text-indigo-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
              </div>
              <p className="text-gray-600">
                One-on-one direct messaging to keep your conversations personal
                and focused.
              </p>
            </motion.div>
            <motion.div
              className="bg-white shadow-lg rounded-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4 }}
            >
              <div className="flex flex-col items-center">
                <FaShieldAlt className="text-4xl text-indigo-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              </div>
              <p className="text-gray-600">
                We take your privacy seriously with end-to-end encryption and
                data protection.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <footer className="bg-indigo-700 py-8 text-white text-center">
        <div className="max-w-7xl mx-auto">
          <motion.p
            className="text-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            &copy; 2024 ChatVerse. All Rights Reserved.
          </motion.p>
          <div className="flex justify-center space-x-6">
            <motion.a
              href="#"
              className="hover:text-yellow-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              className="hover:text-yellow-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4 }}
            >
              Terms of Service
            </motion.a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
