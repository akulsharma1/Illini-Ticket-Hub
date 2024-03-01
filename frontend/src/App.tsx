import React, { useState } from "react";
import Sidebar from "./components/sidebar/sidebar";
import AccountButton from "./components/accountButton/accountButton";
import DashboardTickets from "./components/dashboardTickets/dashboardTickets";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleAccountButtonClick = () => {};

  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AccountButton onClick={handleAccountButtonClick} />
      <DashboardTickets />
    </div>
  );
};

export default MainApp;
