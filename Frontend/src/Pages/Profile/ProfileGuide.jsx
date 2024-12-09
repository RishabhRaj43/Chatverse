import React from "react";
import { motion } from "framer-motion";

const ProfileGuide = ({ onSectionClick }) => {
  return (
    <div className="space-y-2">
      <motion.div
        onClick={() => onSectionClick("Profile Info")}
        className="cursor-pointer p-4 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Profile Info
      </motion.div>
      <motion.div
        onClick={() => onSectionClick("Blocked Users")}
        className="cursor-pointer p-4 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Blocked Users
      </motion.div>
    </div>
  );
};

export default ProfileGuide;
