import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./NewMessageNoti.css";
import useTheme from "../../Context/useTheme";

const NewMessageNoti = ({ data, toastId, toastIsVisible }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  return (
    <div
      className={`${
        toastIsVisible ? "custom-enter" : "custom-exit"
      } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img className="h-12 w-12 rounded-full" src={data?.avatar} alt="" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-lg font-semibold">{data?.username}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {data.message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-20 rounded-tr-lg rounded-br-lg">
        <button
          onClick={() => toast.dismiss(toastId)}
          className={`w-full py-2 rounded-b-lg text-sm font-semibold ${
            theme === "dark"
              ? "text-red-400 hover:text-red-300 focus:ring-red-400"
              : "text-red-600 hover:text-red-500 focus:ring-red-400"
          } focus:outline-none focus:ring-2`}
        >
          Close
        </button>
        <button
          onClick={() => {
            navigate(`/chat/${data.senderId}`);
            toast.dismiss(toastId);
          }}
          className={`w-full py-2 rounded-b-lg text-sm font-semibold ${
            theme === "dark"
              ? "text-indigo-400 hover:text-indigo-300 focus:ring-indigo-400"
              : "text-indigo-600 hover:text-indigo-500 focus:ring-indigo-400"
          } focus:outline-none focus:ring-2`}
        >
          Open
        </button>
      </div>
    </div>
  );
};

export default NewMessageNoti;
