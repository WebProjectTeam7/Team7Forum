import { useState, useEffect } from "react";
import { getAllUsers, switchUserRole } from "../services/users.service";
import { useNavigate } from "react-router-dom";
import UserRoleEnum from "../common/role.enum";
import './CSS/AdminPage.css';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getAllUsers()
            .then(u => {
                setUsers(u);
            }).catch(e => {
                alert(e.message);
            });
    }, []);

    const handleRoleChange = async (uid, newRole) => {
        try {
            await switchUserRole(uid, newRole);
            setUsers(prevUsers =>
                prevUsers.map(user => user.uid === uid ? { ...user, role: newRole } : user)
            );
        } catch (e) {
            alert(e.message);
        }
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
                            <td>
                                <button onClick={() => navigate(`/user-profile/${user.uid}`)}>See profile</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
