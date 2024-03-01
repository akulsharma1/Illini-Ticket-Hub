import React from "react";
import "./accountButton.css";

interface accountButtonProps {
  onClick: () => void;
}

const accountButton: React.FC<accountButtonProps> = ({ onClick }) => {
  return (
    <button className="account-button" onClick={onClick}>
      Account
    </button>
  );
};

export default accountButton;
