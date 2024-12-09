import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AvatarModal from "../../Components/UI/Avatar/AvatarModel";
import authApi from "../../API/User/Auth/AuthApi";
import useProfile from "../../Context/useProfile";
import useTheme from "../../Context/useTheme";
import avatars from "../../API/Avatars/Avatars";

const Signup = () => {
  const { setAvatar, login } = useProfile();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    avatar: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDarkMode = theme === "dark";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarSelect = (url) => {
    setFormData({ ...formData, avatar: url });
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.avatar) {
      toast.error("Please select an avatar");
      return;
    }
    try {
      const res = await authApi.signup(formData);
      toast.success(res?.data?.message);
      setAvatar(formData.avatar);
      login(res?.data?.token);
      navigate("/");
    } catch (error) {
      console.log("error", error);

      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="relative py-4 min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 overflow-hidden">
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.3), transparent 70%), 
                            radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.15), transparent 50%)`,
        }}
      ></motion.div>

      <motion.div
        className="absolute top-10 left-10 w-36 h-36 rounded-full bg-white opacity-20"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      ></motion.div>
      <motion.div
        className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white opacity-30"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      ></motion.div>
      <motion.div
        className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-white opacity-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      ></motion.div>
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-28 h-28 rounded-full bg-white opacity-25"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 rounded-lg shadow-lg px-8 py-5 w-full max-w-md ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-3xl font-extrabold text-center mb-6">
          Create Your Account
        </h2>
        <p className="text-center mb-6">Join the chat revolution!</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              className={`mt-1 block w-full border-b-2 focus:border-indigo-500 outline-none ${
                isDarkMode ? "bg-gray-800 border-gray-600" : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className={`mt-1 block w-full border-b-2 focus:border-indigo-500 outline-none ${
                isDarkMode ? "bg-gray-800 border-gray-600" : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className={`mt-1 block w-full border-b-2 focus:border-indigo-500 outline-none ${
                isDarkMode ? "bg-gray-800 border-gray-600" : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              maxLength={10}
              placeholder="Enter your phone number"
              className={`mt-1 block w-full border-b-2 focus:border-indigo-500 outline-none ${
                isDarkMode ? "bg-gray-800 border-gray-600" : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={`px-4 py-2 rounded-md transition ${
                  isDarkMode
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {formData.avatar ? "Change Avatar" : "Choose Avatar"}
              </button>
              <div>
                {formData.avatar && (
                  <div className="mt-2">
                    <img
                      src={formData.avatar}
                      alt="Selected Avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-md text-lg font-semibold transition ${
              isDarkMode
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            Sign Up
          </button>
          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className={`hover:underline ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              Login here
            </Link>
          </p>
        </form>
      </motion.div>

      {isModalOpen && (
        <AvatarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleAvatarSelect}
          avatars={avatars}
          headline={"Choose your avatar"}
        />
      )}
    </div>
  );
};

export default Signup;
