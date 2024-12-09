import React, { useState } from "react";
import { motion } from "framer-motion";
import contactApi from "../../API/User/Contact/ContactApi";
import { toast } from "react-hot-toast";
import useTheme from "../../Context/useTheme";

const CreateContactModal = ({ setModalOpen, setContacts }) => {
  const [contactType, setContactType] = useState("email");
  const [contactValue, setContactValue] = useState("");
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactValue) return toast.error("Please enter a contact.");

    try {
      const formData = { [contactType]: contactValue };
      const res = await contactApi.save(formData);

      setContacts((prevContacts) => [...prevContacts, res.data.newContact]);
      toast.success(res?.data?.message);
      setModalOpen(false);
    } catch (error) {
      console.log("error", error);

      toast.error(
        error?.response?.data?.message || "Failed to create contact."
      );
    }
  };

  return (
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={` p-6 rounded-lg shadow-lg max-w-sm w-full ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Create Contact
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className={`block ${
                theme === "dark" ? "text-white" : "text-gray-800"
              } text-sm font-medium mb-2`}
            >
              Select Contact Type
            </label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <option value="email">Email</option>
              <option value="phoneNumber">Phone Number</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              className={`block ${
                theme === "dark" ? "text-white" : "text-gray-800"
              } text-sm font-medium mb-2`}
            >
              Enter Contact
            </label>
            <input
              type={contactType === "email" ? "email" : "tel"}
              value={contactValue}
              pattern={
                contactType === "email"
                  ? "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                  : "[0-9]{10}"
              }
              maxLength={contactType === "email" ? 50 : 10}
              minLength={contactType === "email" ? 5 : 10}
              required
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={
                contactType === "email" ? "Enter email" : "Enter phone number"
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-800"
              }`}
            />
          </div>
          <div className="flex justify-between items-center">
            <motion.button
              type="submit"
              className={`px-6 py-2 rounded-lg font-semibold ${
                theme === "dark"
                  ? "bg-gradient-to-r text-white from-indigo-800 via-purple-700 to-pink-700"
                  : "bg-gradient-to-r text-black from-indigo-500 via-purple-400 to-pink-400"
              }`}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  theme === "dark"
                    ? "0px 4px 15px rgba(93, 33, 208, 0.5)"
                    : "0px 4px 15px rgba(255, 105, 180, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Create Contact
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setModalOpen(false)}
              className={`px-6 py-2 rounded-lg font-semibold ${
                theme === "dark"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-500 text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateContactModal;
