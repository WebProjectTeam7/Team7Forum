import { useState, useEffect } from "react";
import { getAllUsers } from "../services/users.service";

export default function AdminPage() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getAllUsers()
            .then(u => {
                setUsers(u);
            }).catch(error => {
                alert(error.message);
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}