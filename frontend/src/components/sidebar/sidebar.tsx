import React from "react";
import "./sidebar.css";

interface sidebarProps {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
}

const sidebar: React.FC<sidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = ["Dashboard", "Buy", "Sell", "Events"];

  return (
    <div className="sidebar">
      <div className="sidebar-heading">Illini Ticket Hub</div>
      <ul className="sidebar-tabs">
        {tabs.map((tab) => (
          <li
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default sidebar;
