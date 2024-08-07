import { useState, useEffect } from 'react';
import { getAllUsers, switchUserRole, banUser } from '../services/users.service';
import { useNavigate } from 'react-router-dom';
import UserRoleEnum from '../common/role.enum';
import './CSS/AdminPage.css';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [banDuration, setBanDuration] = useState({});

    useEffect(() => {
        getAllUsers()
            .then(u => {
                setUsers(u);
            }).catch(e => {
                console.error(e.message);
            });
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
        const duration = banDuration[uid];
        if (!duration) {
            alert('Please enter a valid number of days.');
            return;
        }
        try {
            await banUser(uid, duration);
            alert('User banned successfully.');
        } catch (e) {
            alert(e.message);
        }
    };

    const handleBanDurationChange = (uid, value) => {
        setBanDuration(prev => ({ ...prev, [uid]: value }));
    };

    return (
        <div className="admin-page-container">
            <h1>All Users</h1>
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
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
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
                                <button className="ban-button" onClick={() => handleBanUser(user.uid)}>Ban</button> {/* Added class "ban-button" */}
                            </td>
                            <td>
                                <button onClick={() => navigate(`/user-profile/${user.username}`)}>See profile</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}