import { useState, useContext } from 'react';
import { AppContext } from '../state/app.context';
import { updateUser, uploadUserAvatar } from '../services/users.service';
import { getRemainingBanTime } from '../services/admin.service';
import { MAX_FILE_SIZE } from '../common/views.constants';
import Swal from 'sweetalert2';
import CustomFileInput from '../components/CustomFileInput';
import BeerButton from '../components/BeerButton';
import ThreadsByUser from '../components/ThreadsByUser';
import './CSS/MyProfile.css';

export default function MyProfile() {
    const { user, userData, setAppState } = useContext(AppContext);

    const [editMode, setEditMode] = useState({
        firstName: false,
        lastName: false,
        avatar: false,
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

    const updateUserData = (prop) => (e) => {
        setAppState((prev) => ({
            ...prev,
            userData: {
                ...prev.userData,
                [prop]: e.target.value,
            },
        }));
    };

    const saveChanges = async () => {
        try {
            const updatedData = { ...userData };
            let avatarURL = userData.avatar;

            if (avatarFile) {
                avatarURL = await uploadUserAvatar(userData.uid, avatarFile);
                updatedData.avatar = avatarURL;
            }

            await updateUser(user.uid, updatedData);
            setAppState((prev) => ({
                ...prev,
                userData: updatedData,
            }));

            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile has been updated successfully!',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: `Error updating profile: ${error.message}`,
                confirmButtonText: 'OK',
            });
        }
    };

    const toggleEditMode = (field) => {
        setEditMode({
            ...editMode,
            [field]: !editMode[field]
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file.size > MAX_FILE_SIZE) {
            setAvatarFile(null);
            setAvatarPreviewUrl(null);
            Swal.fire({
                icon: 'warning',
                title: 'File Too Large',
                text: 'The selected file is too large. Please choose a file under 200KB.',
                confirmButtonText: 'OK',
            });
            return;
        }

        setAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
    };

    if (!userData) return <div>Loading...</div>;

    return (
        <>
            <div className="profile-container">
                <h1>My Profile</h1>
                {/* BAN TIMER */}
                {userData.isBanned && (
                    <div className="user-ban-info">
                        <span>Ban Time Left: {getRemainingBanTime(userData.banEndDate)}</span>
                    </div>
                )}
                {/* AVATAR */}
                <div className="profile-field avatar-container">
                    <label>Avatar:</label>
                    <img
                        src={avatarPreviewUrl || userData.avatar || '/src/image/default-profile.png'}
                        alt="Avatar"
                        className="avatar-img"
                    />
                    <CustomFileInput onChange={handleAvatarChange} />
                </div>

                {/* USERNAME */}
                <div className="profile-field">
                    <label>Username:</label>
                    <span>{userData.username}</span>
                </div>

                {/* EMAIL */}
                <div className="profile-field">
                    <label>Email:</label>
                    <span>{userData.email}</span>
                </div>

                {/* FIRST NAME */}
                <div className="profile-field">
                    <label>First Name:</label>
                    {editMode.firstName ? (
                        <input
                            value={userData.firstName}
                            onChange={updateUserData('firstName')}
                            type="text"
                            name="firstName"
                            id="firstName" />
                    ) : (
                        <span>{userData.firstName}</span>
                    )}
                </div>
                <button className="edit-button" onClick={() => toggleEditMode('firstName')}>Edit First Name</button>

                {/* LAST NAME */}
                <div className="profile-field">
                    <label>Last Name: </label>
                    {editMode.lastName ? (
                        <input
                            value={userData.lastName}
                            onChange={updateUserData('lastName')}
                            type="text"
                            name="lastName"
                            id="lastName" />
                    ) : (
                        <span>{userData.lastName}</span>
                    )}
                </div>
                <button className="edit-button" onClick={() => toggleEditMode('lastName')}>Edit Last Name</button>

                {/* ROLE */}
                <div className="profile-field">
                    <label>Role: </label>
                    <span>{userData.role}</span>
                </div>

                {/* Button Container */}
                <div className="button-container">
                    <BeerButton text="Save" onClick={saveChanges} />
                </div>
            </div>
            {userData && <ThreadsByUser username={userData.username} />}
        </>
    );
}
