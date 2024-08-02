import { useState, useEffect } from "react";
import { getAllUsers } from "../services/users.service";
import { useNavigate } from "react-router-dom";

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

    return (
        <div>
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
                            <td>{user.role}</td>
                            <button onClick={() => navigate(`/user-profile/${user.uid}`)}>See profile</button>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}