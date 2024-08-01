import { useState, useContext } from "react";
import { updateUserHandle } from "../services/users.service";
import { AppContext } from "../state/app.context";


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
        <div>
            <h1>My Profile</h1>
            <div>
                <label>Username:</label>
                <span>{userData.username}</span>
            </div>
            <div>
                <label>Email:</label>
                <span>{userData.email}</span>
            </div>
            <div>
                <label>Fist Name:</label>
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
            <div>
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
            <div>
                <label>Role: </label>
                <span>{userData.role}</span>
            </div>
            <button onClick={saveChanges}>Save Changes</button>
        </div>
    )
}