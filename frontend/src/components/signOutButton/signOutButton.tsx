import { Link } from "react-router-dom";
import "./signOutButton.css";

const handleClick = () => {
  localStorage.clear();
};

const SignOutButton: React.FC = () => (
  <Link to="/login">
    <button className="sign-out-button" onClick={handleClick}>
      Sign Out
    </button>
  </Link>
);

export default SignOutButton;
