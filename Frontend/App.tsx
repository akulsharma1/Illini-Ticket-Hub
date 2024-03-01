import React, { useState } from "react";
import sidebar from "./components/sidebar/sidebar";
import accountButton from "./components/accountButton/accountButton";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleAccountButtonClick = () => {};

  return (
    <div className="main-app">
      <sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <accountButton onClick={handleAccountButtonClick} />
      {}
    </div>
  );
};

export default MainApp;
