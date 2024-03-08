import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link component for routing
import "./LoginPage.css"; // Import CSS file for styling
import {
  UserProfileProvider,
  useUserProfile,
} from "../userProfile/userProfile";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { setUserProfile } = useUserProfile();
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5555/account/sign-in", { // fetch email and password data from backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          password: password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Login failed:", data.error);
      }
      setUserProfile(data.profile);
      navigate("/dashboard", { state: { userData: data } });
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="login-container">
      <header className="top-header">
        <h1>Illini Ticket Hub</h1>
      </header>
      <div className="login-card">
        <div className="card-header">
          <h2>Login</h2>
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
              className="login-button"
              onClick={handleLogin}
            >
              Login
            </button>
            <div className="create-account">
              <p>
                New? <Link to="/create-account">Create an Account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LoginPageDataStored: React.FC = () => ( // Wraps component in context
  <UserProfileProvider>
    <LoginPage />
  </UserProfileProvider>
);

export default LoginPageDataStored;
