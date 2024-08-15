import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getDefaultAvatarUrl, getUserAvatarUrl, getUserByUsername } from '../services/users.service';
import './CSS/UserProfile.css';
import { AppContext } from '../state/app.context';
import UserRoleEnum from '../common/role.enum';
import { banUser, getRemainingBanTime } from '../services/admin.service';
import ThreadsByUser from '../components/ThreadsByUser';
import Swal from 'sweetalert2';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const { username } = useParams();
    const [banDuration, setBanDuration] = useState('');
    const { userData } = useContext(AppContext);
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserByUsername(username);
                if (!data) {
                    throw new Error('User not found');
                }
                setUser(data);
                let avatar = await getUserAvatarUrl(userData.uid);
                if (!avatar) {
                    avatar = await getDefaultAvatarUrl();
                }

                setAvatarUrl(avatar);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchUser();
    }, [username]);

    const handleBanUser = async () => {
        if (!banDuration) {
            Swal.fire('Warning', 'Please enter a valid number of days.', 'warning');
            return;
        }
        try {
            await banUser(user.uid, parseInt(banDuration));
            Swal.fire('Success', 'User banned successfully.', 'success');
            setBanDuration('');
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        }
    };

    return (
        <>
            <div className="user-profile-container">
                <h1>User Profile</h1>
                {user ? (
                    <div className="user-profile-details">
                        <img src={avatarUrl} alt="Author Avatar" className="author-avatar" />
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
                        {userData && (userData.role === UserRoleEnum.ADMIN || userData.role === UserRoleEnum.MODERATOR) && (
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
            {user && <ThreadsByUser username={user.username} />}
        </>
    );
}
