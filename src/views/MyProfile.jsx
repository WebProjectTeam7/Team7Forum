import { useState, useContext } from 'react';
import { updateUser, deleteUser } from '../services/users.service';
import { AppContext } from '../state/app.context';
import './CSS/MyProfile.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase-config';
import { signOut } from 'firebase/auth';


export default function MyProfile() {
    const navigate = useNavigate();
    const { user, userData, setAppState } = useContext(AppContext);

    const [editMode, setEditMode] = useState({
        firstName: false,
        lastName: false,
        avatar: false,
    });

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
            await updateUser(user.uid, userData);
            alert('Profile updated successfully');
        } catch (error) {
            alert('Error updating profile: ' + error.message);
        }
    };

    const deleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await deleteUser(user.uid);
                await signOut(auth);
                alert('Account deleted successfully');
                setAppState((prev) => ({
                    ...prev,
                    user: null,
                    userData: {},
                }));
                navigate('/register');
            } catch (error) {
                alert('Error deleting account: ' + error.message);
            }
        }
    };

    const toggleEditMode = (field) => {
        setEditMode({
            ...editMode,
            [field]: !editMode[field]
        });
    };

    return (
        <div className="profile-container">
            <h1>My Profile</h1>

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
            <button className="save-button" onClick={saveChanges}>Save Changes</button>
            <button className="delete-button" onClick={deleteAccount}>Delete Account</button>
        </div>
    );
}
