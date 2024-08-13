import { useState, useContext } from 'react';
import { AppContext } from '../state/app.context';
import { useNavigate } from 'react-router-dom';
import { updateUser, getUserByUsername, uploadUserAvatar, deleteUser } from '../services/users.service';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import {  getRemainingBanTime } from '../services/admin.service';
import { MAX_FILE_SIZE } from '../common/views.constants';
import successGif from '../image/successfully-update-profile.gif';
import errorGif from '../image/error.gif';
import Modal from '../views/Modal';
import CustomFileInput from '../components/CustomFileInput';
import BeerButton from '../components/BeerButton';
import DeleteButton from '../components/DeleteButton';
import './CSS/MyProfile.css';

export default function MyProfile() {
    const navigate = useNavigate();
    const { user, userData, setAppState } = useContext(AppContext);

    const [editMode, setEditMode] = useState({
        firstName: false,
        lastName: false,
        avatar: false,
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
    const [modalMessage, setModalMessage] = useState('');
    const [modalGif, setModalGif] = useState('');
    const [showModal, setShowModal] = useState(false);

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
            let avatarURL = userData.avatar;
            if (avatarFile) {
                avatarURL = await uploadAvatar();
            }

            const updatedData = { ...userData };
            if (avatarURL) {
                updatedData.avatar = avatarURL;
            }

            await updateUser(user.uid, updatedData);
            setAppState((prev) => ({
                ...prev,
                userData: updatedData,
            }));
            setModalMessage('Profile updated successfully');
            setModalGif(successGif);
            setShowModal(true);
        } catch (error) {
            console.error('Error updating profile:', error);
            setModalMessage('Error updating profile: ' + error.message);
            setModalGif(errorGif);
            setShowModal(true);
        }
    };

    const deleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await deleteUser(user.uid);
                await signOut(auth);
                setModalMessage('Account deleted successfully');
                setModalGif(successGif);
                setShowModal(true);
                setAppState((prev) => ({
                    ...prev,
                    user: null,
                    userData: {},
                }));
                navigate('/register');
            } catch (error) {
                setModalMessage('Error deleting account: ' + error.message);
                setModalGif(errorGif);
                setShowModal(true);
            }
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
            alert('The selected file is too large. Please choose a file under 200KB.');
            setAvatarFile(null);
            setAvatarPreviewUrl(null);
            return;
        }

        setAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
    };

    const uploadAvatar = async () => {
        try {
            setIsUploading(true);
            if (avatarFile) {
                const avatarURL = await uploadUserAvatar(userData.uid, avatarFile);
                await updateUser(user.uid, { avatar: avatarURL });
                const updatedUserData = await getUserByUsername(userData.username);
                setAppState((prev) => ({
                    ...prev,
                    userData: updatedUserData,
                }));

                return avatarURL;
            }

            return null;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar: ' + error.message);
            return null;
        } finally {
            setIsUploading(false);
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
            setAvatarPreviewUrl(null);
        }

    };

    if (!userData) return <div>Loading...</div>;

    return (
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
                <button className="upload-avatar-button" onClick={uploadAvatar} disabled={!avatarFile || isUploading}>
                    Upload Avatar
                </button>
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
                <DeleteButton onClick={deleteAccount} />
            </div>

            {/* MODAL */}
            <Modal isVisible={showModal} onClose={() => setShowModal(false)} message={modalMessage} gifUrl={modalGif} />
        </div>
    );
}
