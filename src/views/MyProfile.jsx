import { useState, useContext } from "react";
import { updateUserHandle } from "../services/users.service";
import { AppContext } from "../state/app.context";
import './CSS/MyProfile.css'; // Import the CSS file

export default function MyProfile() {
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
            await updateUserHandle(user.uid, userData);
            alert("Profile updated successfully");
        } catch (error) {
            alert("Error updating profile: " + error.message);
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
            <div className="profile-field">
                <label>Username:</label>
                <span>{userData.username}</span>
            </div>
            <div className="profile-field">
                <label>Email:</label>
                <span>{userData.email}</span>
            </div>
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
                <button onClick={() => toggleEditMode('firstName')}>Edit</button>
            </div>
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
                <button onClick={() => toggleEditMode('lastName')}>Edit</button>
            </div>
            <div className="profile-field">
                <label>Role: </label>
                <span>{userData.role}</span>
            </div>
            <button className="save-button" onClick={saveChanges}>Save Changes</button>
        </div>
    );
}
