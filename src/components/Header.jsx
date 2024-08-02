import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../state/app.context";
import { logoutUser } from "../services/auth.service";
import Search from "./Search";
import "./CSS/Header.css";
export default function Header() {
  const { user, userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  const logout = async () => {
    await logoutUser();
    setAppState({ user: null, userData: null });
    navigate("/login");
  };

  return (
    <header>
      <h1>Forum App</h1>
      <nav>
        <Search />

        <NavLink to="/">Home</NavLink>
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register">Register</NavLink>}
        {user && <NavLink to="/all-posts">All Posts</NavLink>}
        {user && <NavLink to="/post-create">Create Poste</NavLink>}
        {user && <NavLink to="/my-profile">My Profile</NavLink>}
        {userData && userData.role === 'user' && <NavLink to="/admin-page">Admin Page</NavLink>} {/*TODO change 'user' to 'admin' after testing*/}
        {user && <button onClick={logout}>Logout</button>}
        {userData && <span>Welcome, {userData.handle}</span>}
      </nav>
    </header>
  );
}
