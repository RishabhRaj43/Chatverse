import React, { useEffect, useState } from "react";
import authApi from "../../../API/User/Auth/AuthApi";
import useTheme from "../../../Context/useTheme";
import AvatarModal from "../../../Components/UI/Avatar/AvatarModel";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import useProfile from "../../../Context/useProfile";

const ProfileInfo = () => {
  const { theme } = useTheme();
  const { setAvatar } = useProfile();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState({});
  const [editableSocialLinks, setEditableSocialLinks] = useState([]);
  const [status, setStatus] = useState("offline");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authApi.userInfo();
        const userData = response.data.user;
        setUser(userData);
        setEditableUser(userData);
        setEditableSocialLinks(userData.socialLinks || []);
        setStatus(userData.status || "offline");
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleAvatarSelect = async (url) => {
    try {
      await authApi.uploadAvatar({ avatar: url });
      setEditableUser({ ...editableUser, avatar: url });
      setIsModalOpen(false);
      setAvatar(url);
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleSaveChanges = async () => {
    const phoneRegex = /^[0-9]{10}$/; // Validates a 10-digit phone number
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Validates email format

    if (!phoneRegex.test(editableUser.phoneNumber)) {
      return toast.error("Phone number should be exactly 10 digits");
    }

    if (!emailRegex.test(editableUser.email)) {
      return toast.error("Please enter a valid email address");
    }

    try {
      const validSocialLinks = editableSocialLinks.filter(
        (link) => link.platform.trim() !== "" && link.url.trim() !== ""
      );

      const updatedUser = {
        ...editableUser,
        socialLinks: validSocialLinks,
      };

      const response = await authApi.update(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success(response?.data?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const handleAddSocialLink = () => {
    setEditableSocialLinks([...editableSocialLinks, { platform: "", url: "" }]);
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...editableSocialLinks];
    updatedLinks[index][field] = value;
    setEditableSocialLinks(updatedLinks);
  };

  const handleInputChange = (field, value) => {
    setEditableUser({ ...editableUser, [field]: value });
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const inputClass = `w-full p-2 rounded border ${
    theme === "dark"
      ? "bg-gray-800 text-white border-gray-700"
      : "bg-gray-100 text-gray-800 border-gray-300"
  }`;

  const handleDeleteSocialLink = (index) => {
    const updatedLinks = editableSocialLinks.filter((_, i) => i !== index);
    setEditableSocialLinks(updatedLinks);
  };

  return (
    <div
      className={`px-6 rounded-lg min-h-screen shadow-md max-w-4xl mx-auto ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="flex items-center space-x-6 mb-6">
        <div className="relative">
          <div>
            <div className="relative bg-black cursor-pointer w-56 h-56 rounded-full group">
              <img
                src={editableUser?.avatar}
                className="w-56 h-56 object-cover transition-all duration-300 opacity-100 group-hover:opacity-70 rounded-full"
                alt="User Profile"
              />
              <div
                className="absolute top-1/2 left-1/2 text-white text-xl font-bold transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100 p-2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2 items-center"
                onClick={() => setIsModalOpen(true)}
              >
                <h1>Edit</h1>
                <FaPen />
              </div>
            </div>
          </div>
          <span
            className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ${
              status === "online" ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
        </div>
        <div>
          <h3 className="mt-4 text-lg font-medium">Username</h3>
          {isEditing ? (
            <input
              type="text"
              value={editableUser.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className={inputClass}
            />
          ) : (
            <p>{user?.username}</p>
          )}

          <h3 className="mt-4 text-lg font-medium">Email</h3>
          {isEditing ? (
            <input
              type="email"
              value={editableUser.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={inputClass}
            />
          ) : (
            <p>{user?.email}</p>
          )}

          <h3 className="mt-4 text-lg font-medium">Phone Number</h3>
          {isEditing ? (
            <input
              type="text"
              value={editableUser.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className={inputClass}
            />
          ) : (
            <p>{user?.phoneNumber}</p>
          )}

          <h3 className="mt-4 text-lg font-medium">Date of Birth</h3>
          {isEditing ? (
            <input
              type="date"
              value={
                editableUser.dateOfBirth
                  ? new Date(editableUser.dateOfBirth)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className={inputClass}
            />
          ) : (
            <p>
              {user?.dateOfBirth
                ? new Date(user?.dateOfBirth).toLocaleDateString("en-GB")
                : "Not provided"}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Bio</h3>
        {isEditing ? (
          <textarea
            value={editableUser.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        ) : (
          <p>{user?.bio || "No bio available."}</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Social Links</h3>
        {isEditing ? (
          <div className="space-y-2">
            {editableSocialLinks.map((link, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "platform", e.target.value)
                  }
                  placeholder="Platform"
                  className={`${inputClass} w-1/3`}
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "url", e.target.value)
                  }
                  placeholder="URL"
                  className={`${inputClass} w-2/3`}
                />
                <button
                  onClick={() => handleDeleteSocialLink(index)} // Delete function
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddSocialLink}
              className="mt-2 py-2 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-all"
            >
              Add Link
            </button>
          </div>
        ) : editableSocialLinks.length > 0 ? (
          <ul className="space-y-3">
            {editableSocialLinks.map((link, index) => (
              <li key={index} className="flex items-center space-x-2">
                {/* Add social platform icons */}
                <i
                  className={`fab fa-${link.platform.toLowerCase()} text-xl`}
                />
                <Link
                  to={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:text-indigo-700 hover:underline font-semibold transition-all"
                >
                  {link.platform}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No social links available.</p>
        )}
      </div>

      <div className="flex items-center justify-end space-x-4">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="py-2 px-4 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="py-2 px-4 bg-green-500 text-white rounded"
            >
              Save
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="py-2 px-4 bg-indigo-500 text-white rounded"
          >
            Edit
          </button>
        )}
      </div>

      {isModalOpen && (
        <AvatarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleAvatarSelect}
        />
      )}
    </div>
  );
};

export default ProfileInfo;
