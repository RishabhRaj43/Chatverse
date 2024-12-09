import React, { useState } from "react";
import ProfileGuide from "./ProfileGuide";
import ProfileInfo from "./ProfileElements/ProfileInfo";
import useTheme from "../../Context/useTheme";

const ProfileMain = () => {
  const [currentSection, setCurrentSection] = useState("Profile Info");
  const { theme } = useTheme(); // Get the current theme from the store

  const handleSectionClick = (section) => {
    setCurrentSection(section);
  };

  return (
    <div
      className={`flex ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="w-1/4 p-4 border-r">
        <ProfileGuide onSectionClick={handleSectionClick} />
      </div>
      <div className="w-3/4 p-4">
        {currentSection === "Profile Info" && <ProfileInfo />}
        {currentSection === "Blocked Users" && (
          <div>
            <h2>Blocked Users</h2>
            <p>List of users that are blocked.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileMain;
