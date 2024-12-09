import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import contactApi from "../../../API/User/Contact/ContactApi";
import { SiTicktick } from "react-icons/si";
import groupAvatars from "../../../API/Avatars/GroupAvatar";
import AvatarModal from "../Avatar/AvatarModel";

const CreateGroupModal = ({
  onGroupClose,
  onSubmit,
  theme,
  groupHandle,
  setGroupHandle,
  groupName,
  setGroupName,
  groupDescription,
  setGroupDescription,
  groupMembers,
  setGroupMembers,
  isPrivate,
  setIsPrivate,
  groupIconUrl,
  setGroupIconUrl,
}) => {
  const [allContacts, setAllContacts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToName, setMemberToName] = useState({});

  const handleSubmit = async () => {
    try {
      onSubmit({
        name: groupName,
        handle: groupHandle,
        description: groupDescription,
        members: [...groupMembers],
        isPrivate,
        groupIcon: groupIconUrl,
        memberToName,
      });
    } catch (error) {
      console.log("Error in handleSubmit", error);
    }
  };

  const bringContacts = async () => {
    try {
      const res = await contactApi.get();
      setAllContacts(res.data.contacts);
    } catch (error) {
      console.log("Error in bringContact", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleAddMember = (contactId, name) => {
    let updatedMembers = groupMembers;
    if (!groupMembers.includes(contactId)) {
      updatedMembers = [...groupMembers, contactId];
      setMemberToName((prevMemberToName) => ({
        ...prevMemberToName,
        [contactId]: name,
      }));
    } else {
      updatedMembers = groupMembers.filter((id) => id !== contactId);
      delete memberToName[contactId];
    }
    setGroupMembers(updatedMembers);
  };

  const handleAvatarSelect = (url) => {
    setGroupIconUrl(url);
    setIsModalOpen(false);
  };

  return (
    <AnimatePresence>
      {
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`p-6 rounded-lg overflow-y-auto max-h-screen shadow-lg max-w-sm w-full ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-gray-800"
            }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
          >
            <h3
              className={`text-xl font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Create Group
            </h3>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={`w-full mb-3 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-800"
              }`}
            />
            <input
              type="text"
              placeholder="Group Handle"
              value={groupHandle}
              onChange={(e) => setGroupHandle(e.target.value)}
              className={`w-full mb-3 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-800"
              }`}
            />
            <textarea
              placeholder="Group Description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className={`w-full mb-3 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-800"
              }`}
            />

            <div className="mb-3">
              <div
                onClick={() => {
                  bringContacts();
                  setDropdownOpen(!dropdownOpen);
                }}
                className={`cursor-pointer w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {groupMembers.length > 0
                  ? `Selected Members: ${groupMembers.length}`
                  : "Select Members"}
              </div>

              {dropdownOpen &&
                (allContacts?.length > 0 ? (
                  <div className="w-full max-h-40 overflow-y-auto bg-white shadow-lg z-20">
                    {allContacts?.map((contact, ind) => (
                      <div
                        key={contact?._id}
                        className={`flex items-center px-4 py-2 ${
                          theme === "dark"
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-white text-gray-800 hover:bg-gray-100"
                        } cursor-pointer ${
                          groupMembers?.includes(contact?._id) &&
                          theme === "dark"
                            ? "bg-gray-600"
                            : ""
                        }`}
                        onClick={() =>
                          handleAddMember(contact?._id, contact?.username)
                        }
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <img
                              src={contact?.avatar}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            {contact?.username}
                          </div>
                          <div>
                            {groupMembers?.includes(contact?._id) && (
                              <SiTicktick className="text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full max-h-40 shadow-lg z-20">
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      No contacts found
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                className={`px-4 py-2 rounded-lg bg-gradient-to-r ${
                  theme === "dark" ? "text-white" : "text-black"
                } from-indigo-800 via-purple-700 to-pink-700`}
                onClick={() => setIsModalOpen(true)}
              >
                Choose Group Icon
              </button>

              {groupIconUrl && (
                <img
                  src={groupIconUrl}
                  className="w-20 h-20 rounded-full"
                  alt=""
                />
              )}
            </div>

            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate((prev) => !prev)}
                className="mr-2"
              />
              <label
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                Private Group
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setGroupName("");
                  setGroupHandle("");
                  setGroupDescription("");
                  setGroupMembers([]);
                  setIsPrivate(false);
                  setGroupIconUrl(null);
                  onGroupClose();
                }}
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-r text-white from-indigo-800 via-purple-700 to-pink-700"
                    : "bg-gradient-to-r text-black from-indigo-500 via-purple-400 to-pink-400"
                }`}
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      }
      <AvatarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAvatarSelect}
        avatars={groupAvatars}
        headline="Select Group Icon"
      />
    </AnimatePresence>
  );
};

export default CreateGroupModal;
