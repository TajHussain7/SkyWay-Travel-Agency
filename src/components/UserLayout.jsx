import { useState } from "react";
import UserSidebar from "./UserSidebar";

const UserLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div
        className={`flex-1 ${
          isExpanded ? "ml-64" : "ml-20"
        } transition-all duration-300 overflow-x-hidden`}
        style={{ width: `calc(100% - ${isExpanded ? "256px" : "80px"})` }}
      >
        {children}
      </div>
    </div>
  );
};

export default UserLayout;
