import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../state/app.context';
import { logoutUser } from '../services/auth.service';
import Search from './Search';
import './CSS/Header.css';
import UserRoleEnum from '../common/role.enum';
import BeerSwitch from './BeerSwitch';
import { getUsersCount } from '../services/users.service';
import { getThreadsCount } from '../services/thread.service';


export default function Header() {
    const { user, userData, setAppState } = useContext(AppContext);
    const navigate = useNavigate();
    const [usersCount, setUsersCount] = useState(13);
    const [threadsCount, setThreadsCount] = useState(69);

    useEffect(() => {
        fetchUsersCount();
        fetchThreadsCount();
    }, []);

    const logout = async () => {
        await logoutUser();
        setAppState({ user: null, userData: null });
        navigate('/login');
    };

    const fetchUsersCount = async () => {
        const usersCount = await getUsersCount();
        setUsersCount(usersCount);
    };

    const fetchThreadsCount = async () => {
        const threadsCount = await getThreadsCount();
        setThreadsCount(threadsCount);
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
                <NavLink to="/beerpedia">Beerpedia</NavLink>
                {user && <NavLink to="/surveys">Beercyclopedia</NavLink>}
                {user && <NavLink to="/my-profile">My Profile</NavLink>}
                {userData && userData.role === UserRoleEnum.ADMIN && (
                    <NavLink to="/admin-page">Admin Page</NavLink>
                )}
                {user && <button onClick={logout}>Logout</button>}
                <BeerSwitch />
            </nav>
            <h3>{threadsCount} posts from {usersCount} users</h3>
        </header>
    );
}
