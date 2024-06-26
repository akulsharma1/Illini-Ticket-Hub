import React from "react";
import "./sidebar.css";
import { Link } from "react-router-dom";

interface sidebarProps {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
}

const sidebar: React.FC<sidebarProps> = ({ activeTab, setActiveTab }) => {
  // const tabs = ["Dashboard", "Buy", "Sell", "Events"]; 
  const tabs = ["Dashboard" , "Events" , "Account"]; // New update: we don't actually want buy and sell in sidebar

  return (
    <div className="sidebar">
      <div className="sidebar-heading">Illini Ticket Hub</div>
      <ul className="sidebar-tabs">
        {tabs.map((tab) => (
          <Link to={`/${tab.toLowerCase()}`} key={tab}>
            <li className={activeTab === tab ? "active" : ""}>
              <span>{tab}</span>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default sidebar;
