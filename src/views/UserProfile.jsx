import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserData } from "../services/users.service";
import './CSS/UserProfile.css';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        getUserData(id)
            .then(data => setUser(data[Object.keys(data)[0]]))
            .catch(e => alert(e.message));
    }, [id]);

    return (
        <div className="user-profile-container">
            <h1>User Profile</h1>
            {user ? (
                <div className="user-profile-details">
                    <div>
                        <label>Username:</label>
                        <span>{user.username}</span>
                    </div>
                    <div>
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>
                    <div>
                        <label>First Name:</label>
                        <span>{user.firstName}</span>
                    </div>
                    <div>
                        <label>Last Name: </label>
                        <span>{user.lastName}</span>
                    </div>
                    <div>
                        <label>Role: </label>
                        <span>{user.role}</span>
                    </div>
                </div>
            ) : (
                <div className="user-not-found">User not found</div>
            )}
        </div>
    );
}