import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link component
import './LoginPage.css'; // Import CSS file for styling

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleLogin = () => {
    // TODO - add backend logging in logic hered    
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
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
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
            <Link to="/dashboard"> {/* Use Link to navigate to the dashboard */}
              <button type="button" className="login-button" onClick={handleLogin}>Login</button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
