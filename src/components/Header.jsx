import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../state/app.context';
import { logoutUser } from '../services/auth.service';
import Search from './Search';
import './CSS/Header.css';

import UserRoleEnum from '../common/role.enum';
import BeerSwitch from './BeerSwitch';

export default function Header() {
    const { user, userData, setAppState } = useContext(AppContext);
    const navigate = useNavigate();

    const logout = async () => {
        await logoutUser();
        setAppState({ user: null, userData: null });
        navigate('/login');
    };

    return (
        <header>
            <h1>Beer Foam</h1>
            <h2>your beer forum</h2>
            {userData && <span>Welcome, {userData.username}</span>}
            <nav>
                <Search />
                <NavLink to="/">Home</NavLink>
                <NavLink to="/forum">Forum</NavLink>
                {!user && <NavLink to="/login">Login</NavLink>}
                {!user && <NavLink to="/register">Register</NavLink>}
                {user && <NavLink to="/surveys">Beercyclopedia</NavLink>}
                {user && <NavLink to="/my-profile">My Profile</NavLink>}
                {userData && userData.role === UserRoleEnum.ADMIN && (
                    <NavLink to="/admin-page">Admin Page</NavLink>
                )}
                {user && <button onClick={logout}>Logout</button>}
                <BeerSwitch />
            </nav>
        </header>
    );
}
