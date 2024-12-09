import React from "react";
import useTheme from "../../../Context/useTheme";

const AvatarModal = ({ isOpen, onClose, onSelect,avatars,headline }) => {
  const { theme } = useTheme(); 

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        theme === "dark" ? "bg-opacity-75" : "bg-opacity-50"
      }`}
    >
      <div
        className={`p-6 rounded-md shadow-lg max-w-md w-full ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">{headline}</h2>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((avatar, index) => (
            <img
              key={index}
              src={avatar.url}
              alt={`Avatar ${index}`}
              className="cursor-pointer w-20 h-20 rounded-full hover:scale-105 transition"
              onClick={() => onSelect(avatar.url)}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className={`mt-4 w-full py-2 rounded-md transition ${
            theme === "dark" ? "bg-red-500 hover:bg-red-400" : "bg-red-300 hover:bg-red-500"
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AvatarModal;
