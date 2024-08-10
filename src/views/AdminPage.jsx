import { useState, useEffect, useContext } from 'react';
import { getAllUsers, switchUserRole, banUser, getRemainingBanTime, unbanUser } from '../services/users.service';
import { useNavigate } from 'react-router-dom';
import UserRoleEnum from '../common/role.enum';
import './CSS/AdminPage.css';
import DeleteButton from '../components/deletebutton';
import { deleteUser } from 'firebase/auth';
import { AppContext } from '../state/app.context';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [banDuration, setBanDuration] = useState({});
    const [bannedUsers, setBannedUsers] = useState([]);
    const [view, setView] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { userData } = useContext(AppContext);

    useEffect(() => {
        fetchAllUsers();
        fetchBannedUsers();
    }, []);

    const handleRoleChange = async (uid, newRole) => {
        try {
            await switchUserRole(uid, newRole);
            setUsers(prevUsers =>
                prevUsers.map(user => user.uid === uid ? { ...user, role: newRole } : user)
            );
        } catch (e) {
            console.error(e.message);
        }
    };

    const handleBanUser = async (uid) => {
        const userToBan = users.find(user => user.uid === uid);
        if (userToBan.role === UserRoleEnum.ADMIN) {
            alert('You cannot ban another admin.');
            return;
        }

        const duration = banDuration[uid];
        if (!duration) {
            alert('Please enter a valid number of days.');
            return;
        }
        try {
            await banUser(uid, Number(duration, 10));
            alert('User banned successfully.');
        } catch (e) {
            alert(e.message);
        }
    };

    const handleUnbanUser = async (uid) => {
        try {
            await unbanUser(uid);
            alert('User unbanned successfully.');
            fetchBannedUsers();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleBanDurationChange = (uid, value) => {
        setBanDuration(prev => ({ ...prev, [uid]: value }));
    };

    const fetchAllUsers = async () => {
        try {
            const users = await getAllUsers();
            setUsers(users);
        } catch (e) {
            console.error(e.message);
        }
    };

    const fetchBannedUsers = async () => {
        try {
            const users = await getAllUsers();
            const banned = users.filter(user => user.isBanned);
            setBannedUsers(banned);
        } catch (e) {
            console.error(e.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBannedUsers = bannedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteUser = async (uid, role) => {
        if (role === UserRoleEnum.ADMIN) {
            alert('You cannot delete another admin.');
            return;
        }
        if (uid === userData.uid) {
            alert('You cannot delete your own account.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(uid);
                alert('User deleted successfully.');
                fetchAllUsers();
                fetchBannedUsers();
            } catch (e) {
                alert(e.message);
            }
        }
    };

    return (
        <div className="admin-page-container">
            <h1>All Users</h1>
            <div className="nav">
                <button onClick={() => setView('all')}>All Users</button>
                <button onClick={() => setView('banned')}>Banned Users</button>
            </div>
            <input
                type="text"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
            />
            {view === 'all' && (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th>Ban Duration (days)</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.uid}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                    >
                                        <option value={UserRoleEnum.USER}>User</option>
                                        <option value={UserRoleEnum.MODERATOR}>Moderator</option>
                                        <option value={UserRoleEnum.ADMIN}>Admin</option>
                                    </select>
                                </td>
                                <td className="ban-user-section">
                                    <input
                                        type="number"
                                        className="ban-duration-input"
                                        placeholder="Days"
                                        value={banDuration[user.uid] || ''}
                                        onChange={(e) => handleBanDurationChange(user.uid, e.target.value)}
                                    />
                                    <button className="ban-button" onClick={() => handleBanUser(user.uid)}>Ban</button>
                                </td>
                                <td>
                                    <button
                                        className="see-profile-button"
                                        onClick={() => navigate(`/user-profile/${user.username}`)}>See profile
                                    </button>
                                </td>
                                <td>
                                    <DeleteButton onClick={() => handleDeleteUser(user.uid, user.role)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {view === 'banned' && (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th>Ban Time Left</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBannedUsers.map(user => (
                            <tr key={user.uid}>
                                <td className={`role-${user.role.toLowerCase()}`}>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.role}</td>
                                <td>{getRemainingBanTime(user.banEndDate)}</td>
                                <td>
                                    <button className="unban-button" onClick={() => handleUnbanUser(user.uid)}>Unban</button>
                                </td>
                                <td>
                                    <DeleteButton onClick={() => handleDeleteUser(user.uid, user.role)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}