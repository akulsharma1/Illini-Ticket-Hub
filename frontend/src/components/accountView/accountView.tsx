import React, { useState, useEffect } from "react";
import "./accountView.css";

interface Account {
  username: string;
  email: string;
  // Add more fields as needed
}

const AccountDetails: React.FC<{ account: Account | null }> = ({ account }) => {
  if (!account) {
    return <p>Loading account data...</p>;
  }

  return (
    <div className="account-details">
      <p>
        <strong>Username:</strong> {account.username}
      </p>
      <p>
        <strong>Email:</strong> {account.email}
      </p>
      {/* Add more fields here as needed */}
    </div>
  );
};

const AccountView: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    // Simulate fetching data with a delay
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dummy account data
      const dummyAccount: Account = {
        username: "john_doe",
        email: "john.doe@example.com",
        // Add more dummy data as needed
      };

      setAccount(dummyAccount);
    };

    fetchData();
  }, []);

  //const [activeTab, setActiveTab] = useState("Account");

  const renderAccountDetails = () => (
    <div className="card">
      <div className="account-view">
        <h1>Account Information</h1>
        <AccountDetails account={account} />
      </div>
    </div>
    // account-view is not a defined css element in App.css so react will auto generate it at runtime
    // (we have account-view inside a card, so its styling is irrelevant)
  );

  return (
    <>
      <div
        className="sign-out-button"
        onClick={() => alert("Sign out clicked")}
      >
        Sign Out
      </div>
      {renderAccountDetails()}
    </>
  );
};

export default AccountView;
