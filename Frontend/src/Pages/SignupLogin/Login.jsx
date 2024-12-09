import React from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../API/User/Auth/AuthApi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import useProfile from "../../Context/useProfile";
import useTheme from "../../Context/useTheme";

const Login = () => {
  const navigate = useNavigate();
  const { login, setAvatar } = useProfile();
  const { theme } = useTheme();

  const isDarkMode = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await authApi.login(data);
      login(res?.data?.token);
      setAvatar(res?.data?.avatar);
      toast.success(res?.data?.message);
      navigate("/");
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="relative py-4 min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 overflow-hidden">
      {/* Animated Background Elements */}
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

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 rounded-lg shadow-lg px-8 py-5 w-full max-w-md ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-3xl font-extrabold text-center mb-6">
          Login to Your Account
        </h2>
        <p className="text-center mb-6">
          Join the chat revolution! Connect with friends and communities.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
              className={`mt-1 block w-full border-b-2 focus:border-indigo-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              className={`mt-1 block w-full border-b-2 focus:border-indigo-500 outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "border-gray-300"
              }`}
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-md text-lg font-semibold transition ${
              isDarkMode
                ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            Login
          </button>
          <p className="text-center mt-4">
            Want to create an account?{" "}
            <Link
              to="/auth/signup"
              className={`hover:underline ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              Signup here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
