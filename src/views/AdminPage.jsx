import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, switchUserRole, deleteUser } from '../services/users.service';
import { banUser, deleteReport, getRemainingBanTime, getReports, unbanUser } from '../services/admin.service';
import { AppContext } from '../state/app.context';
import { getThreadById } from '../services/thread.service';
import { getReplyById } from '../services/reply.service';
import { format } from 'date-fns';
import DeleteButton from '../components/deletebutton';
import UserRoleEnum from '../common/role.enum';
import banUserImage from '../image/ban-user.png';
import SuccessModal from './SuccessModal';
import Swal from 'sweetalert2';
import './CSS/AdminPage.css';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [banDuration, setBanDuration] = useState({});
    const [bannedUsers, setBannedUsers] = useState([]);
    const [view, setView] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { userData } = useContext(AppContext);
    const [reports, setReports] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalImage, setModalImage] = useState('');

    useEffect(() => {
        fetchAllUsers();
        fetchBannedUsers();
        fetchReports();
    }, []);

    const handleRoleChange = async (uid, newRole) => {
        try {
            await switchUserRole(uid, newRole);
            setUsers(prevUsers =>
                prevUsers.map(user => user.uid === uid ? { ...user, role: newRole } : user)
            );
        } catch (e) {
            console.error(e.message);
        }
    };

    const handleBanUser = async (uid) => {
        const userToBan = users.find(user => user.uid === uid);
        if (userToBan.role === UserRoleEnum.ADMIN) {
            Swal.fire('Error', 'You cannot ban another admin.', 'error');
            return;
        }

        const duration = banDuration[uid];
        if (!duration) {
            Swal.fire('Error', 'Please enter a valid number of days.', 'warning');
            return;
        }
        try {
            await banUser(uid, Number(duration, 10));
            fetchBannedUsers();
            alert('User banned successfully.');
            Swal.fire('Success', 'User banned successfully.', 'success');
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        }
    };

    const handleUnbanUser = async (uid) => {
        try {
            await unbanUser(uid);
            setModalMessage('User unbanned successfully.');
            setModalImage(banUserImage);
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 5000);
            fetchBannedUsers();
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        }
    };

    const handleBanDurationChange = (uid, value) => {
        setBanDuration(prev => ({ ...prev, [uid]: value }));
    };

    const fetchAllUsers = async () => {
        try {
            const users = await getAllUsers();
            setUsers(users);
        } catch (e) {
            console.error(e.message);
        }
    };

    const fetchBannedUsers = async () => {
        try {
            const users = await getAllUsers();
            const banned = users.filter(user => user.isBanned);
            setBannedUsers(banned);
        } catch (e) {
            console.error(e.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBannedUsers = bannedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteUser = async (uid, role) => {
        if (role === UserRoleEnum.ADMIN) {
            Swal.fire('Error', 'You cannot delete another admin.', 'error');
            return;
        }
        if (uid === userData.uid) {
            Swal.fire('Error', 'You cannot delete your own account.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this user? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(uid);
                Swal.fire('Deleted!', 'User deleted successfully.', 'success');
                fetchAllUsers();
                fetchBannedUsers();
            } catch (e) {
                Swal.fire('Error', e.message, 'error');
            }
        }
    };

    const fetchReports = async () => {
        try {
            const fetchedReports = await getReports();
            setReports(fetchedReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleDeleteReport = async (reportId) => {
        try {
            await deleteReport(reportId);
            setReports(reports.filter(report => report.id !== reportId));
            Swal.fire('Success', 'Report deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    const handleGoToPost = async (targetId, type) => {
        try {
            if (type === 'thread') {
                const thread = await getThreadById(targetId);
                if (thread) {
                    navigate(`/forum/thread/${targetId}`);
                } else {
                    Swal.fire('Error', 'Thread not found', 'error');
                }
            } else if (type === 'reply') {
                const reply = await getReplyById(targetId);
                if (reply) {
                    navigate(`/forum/thread/${reply.threadId}`);
                } else {
                    Swal.fire('Error', 'Reply not found', 'error');
                }
            }
        } catch (error) {
            console.error('Error navigating to post:', error);
        }
    };

    return (
        <div className="admin-page-container">
            {showSuccessModal && (
                <SuccessModal
                    message={modalMessage}
                    image={modalImage}
                    onClose={() => setShowSuccessModal(false)} />
            )}
            <h1>Admin Panel</h1>
            <div className="nav">
                <button onClick={() => setView('all')}>All Users</button>
                <button onClick={() => setView('banned')}>Banned Users</button>
                <button onClick={() => setView('reports')}>Reports</button>
            </div>
            <input
                type="text"
                placeholder="Search by username, email, or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
            />
            {view === 'all' && (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th>Ban Duration (days)</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.uid}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td className='role-dropdown'>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                    >
                                        <option value={UserRoleEnum.USER}>User</option>
                                        <option value={UserRoleEnum.MODERATOR}>Moderator</option>
                                        <option value={UserRoleEnum.ADMIN}>Admin</option>
                                    </select>
                                </td>
                                <td className="ban-user-section">
                                    <input
                                        type="number"
                                        className="ban-duration-input"
                                        placeholder="Days"
                                        value={banDuration[user.uid] || ''}
                                        onChange={(e) => handleBanDurationChange(user.uid, e.target.value)}
                                    />
                                    <button className="ban-button" onClick={() => handleBanUser(user.uid)}>Ban</button>
                                </td>
                                <td>
                                    <button
                                        className="see-profile-button"
                                        onClick={() => navigate(`/user-profile/${user.username}`)}>Profile
                                    </button>
                                </td>
                                <td>
                                    <DeleteButton onClick={() => handleDeleteUser(user.uid, user.role)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {view === 'banned' && (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th>Ban Time Left</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBannedUsers.map(user => (
                            <tr key={user.uid}>
                                <td className={`role-${user.role.toLowerCase()}`}>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.role}</td>
                                <td>{getRemainingBanTime(user.banEndDate)}</td>
                                <td>
                                    <button className="unban-button" onClick={() => handleUnbanUser(user.uid)}>Unban</button>
                                </td>
                                <td>
                                    <DeleteButton onClick={() => handleDeleteUser(user.uid, user.role)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {view === 'reports' && (
                <div className="reports-container">
                    <h2>Reports</h2>
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Reported User</th>
                                <th>Reported By</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Content</th>
                                <th>Reason</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length > 0 ? (
                                reports.map(report => (
                                    <tr key={report.id}>
                                        <td>{report.reportedUser}</td>
                                        <td>{report.reporter}</td>
                                        <td>{format(new Date(report.reportedAt), 'PPpp')}</td>
                                        <td>{report.type}</td>
                                        <td className="content-cell">{report.content}</td>
                                        <td>{report.reason}</td>
                                        <td>
                                            <button onClick={() => handleDeleteReport(report.id)}>Dismiss</button>
                                            <button onClick={() => handleGoToPost(report.targetId, report.type)}>Go to Post</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">No reports available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
