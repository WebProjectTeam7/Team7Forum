import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByUsername } from '../services/users.service';
import './CSS/UserProfile.css';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const { username } = useParams();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserByUsername(username);
                if (!data) {
                    throw new Error('User not found');
                }
                setUser(data);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchUser();
    }, [username]);

    return (
        <div className="user-profile-container">
            <h1>User Profile</h1>
            {user ? (
                <div className="user-profile-details">
                    <img src={user.avatar || '/src/image/default-profile.png'} alt="Author Avatar" className="author-avatar" />
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
