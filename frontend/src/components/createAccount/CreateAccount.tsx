import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link component for routing
import "./CreateAccount.css"; // Import CSS file for styling
import {
  UserProfileProvider,
  useUserProfile,
} from "../userProfile/userProfile";

const CreateAccount: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  // const { setUserProfile } = useUserProfile();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };



  // const createAccount = () => {
  //   // TODO - one of us will add the backend logic for creating an account later
  //   // Will need to make an entry into database
  //   const userData = { email };
  //   // navigate("/dashboard", {state: { userData } }); // after creating an account, forward to database
  //   // To make it easier, I decided that we should just go to login after someone creates an account
  //   navigate("/login", { state: { userData } }); // direct straight to log in after creating acc
  // };

  const createAccount = async () => {
    try {
      const response = await fetch("http://localhost:5555/account/create", {
        // fetch email and password data from backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          password: password,
          name: name,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Handle wrong password
        setErrorMessage("Failed to create. Please try again");
        throw new Error("Bad account make");
      }
      // setUserProfile(data.profile);
      navigate("/login", { state: { userData: data } });
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="create-container">
      <header className="top-header">
        <h1>Illini Ticket Hub</h1>
      </header>
      <div className="create-card">
        <div className="card-header">
          <h2>Create Account</h2>
        </div>
        <div className="card-body">
          <form>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <button
              type="button"
              className="create-button"
              onClick={createAccount}
            >
              Create Account
            </button>
            <div className="create-account">
              <p>
                Already have an account? <Link to="/login">Sign in!</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;