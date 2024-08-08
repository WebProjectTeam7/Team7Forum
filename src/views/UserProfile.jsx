import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { banUser, getUserByUsername } from '../services/users.service';
import './CSS/UserProfile.css';
import { AppContext } from '../state/app.context';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const { username } = useParams();
    const [banDuration, setBanDuration] = useState('');
    const { userData } = useContext(AppContext);

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

    const handleBanUser = async () => {
        if (!banDuration) {
            alert('Please enter a valid number of days.');
            return;
        }
        try {
            await banUser(user.uid, parseInt(banDuration));
            alert('User banned successfully.');
            setBanDuration('');
        } catch (e) {
            alert(e.message);
        }
    };

    const getRemainingBanTime = (banEndDate) => {
        const now = new Date();
        const end = new Date(banEndDate);
        const diff = end - now;
        if (diff <= 0) return 'Ban has expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days} days ${hours} hours`;
    };


    return (
        <div className="user-profile-container">
            <h1>User Profile</h1>
            {user ? (
                <div className="user-profile-details">
                    <img src={user.avatar || '/src/image/default-profile.png'} alt="Author Avatar" className="author-avatar" />
                    {user.isBanned && (
                        <div className="user-ban-info">
                            <span>Ban Time Left: {getRemainingBanTime(user.banEndDate)}</span>
                        </div>
                    )}
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
                    {userData && userData.role === 'admin' && (
                        <div className="ban-user-section">
                            <input
                                type="number"
                                value={banDuration}
                                onChange={(e) => setBanDuration(e.target.value)}
                                placeholder="Days"
                                className="user-ban-duration-input"
                            />
                            <button onClick={handleBanUser} className="user-ban-button">Ban User</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="user-not-found">User not found</div>
            )}
        </div>
    );
}
