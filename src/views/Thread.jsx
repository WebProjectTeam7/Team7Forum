import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadById, updateThread, deleteThread, handleThreadVote, incrementThreadViews } from '../services/thread.service';
import { AppContext } from '../state/app.context';
import Replies from '../components/Replies';
import UserRoleEnum from '../common/role.enum';
import { FaArrowAltCircleDown, FaArrowAltCircleUp, FaEye } from 'react-icons/fa';
import './CSS/Thread.css';
import { getUserByUsername, isUserBanned } from '../services/users.service';
import UserInfo from '../components/UserInfo';
import { removeThreadIdFromCategory } from '../services/category.service';

export default function Thread() {
    const { threadId } = useParams();
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editThreadTitle, setEditThreadTitle] = useState('');
    const [editThreadContent, setEditThreadContent] = useState('');
    const [userAuthor, setUserAuthor] = useState({});
    const [userVote, setUserVote] = useState(0);
    const [fetchTrigger, setFetchTrigger] = useState(false);

    useEffect(() => {
        incrementViews();
    }, []);

    useEffect(() => {
        fetchThread();
    }, [fetchTrigger]);


    const incrementViews = async () => {
        try {
            await incrementThreadViews(threadId);
            setFetchTrigger(!fetchTrigger);
        } catch (error) {
            console.error('Error incrementing thread views:', error);
        }
    };

    const fetchThread = async () => {
        try {
            const fetchedThread = await getThreadById(threadId);
            setThread(fetchedThread);
            setEditThreadTitle(fetchedThread.title);
            setEditThreadContent(fetchedThread.content);
            fetchUserAuthor(fetchedThread.authorName);
            const vote = fetchedThread.upvotes?.includes(userData.username) ? 1 :
                fetchedThread.downvotes?.includes(userData.username) ? -1 : 0;
            setUserVote(vote);
        } catch (error) {
            console.error('Error fetching thread:', error);
        }
    };

    const fetchUserAuthor = async (username) => {
        try {
            const user = await getUserByUsername(username);
            setUserAuthor(user);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleEditThread = async () => {
        try {
            const updatedData = { title: editThreadTitle, content: editThreadContent };
            await updateThread(threadId, updatedData);
            setEditMode(false);
            setFetchTrigger(!fetchTrigger);
        } catch (error) {
            console.error('Error editing thread:', error);
        }
    };

    const handleDeleteThread = async () => {
        if (window.confirm('Are you sure you want to delete this thread?')) {
            try {
                await deleteThread(threadId);
                await removeThreadIdFromCategory(thread.categoryId, threadId);
                navigate('/forum');
            } catch (error) {
                console.error('Error deleting thread:', error);
            }
        }
    };

    const handleVote = async (vote) => {
        const newVote = userVote === vote ? 0 : vote;

        const banned = await isUserBanned(userData.uid);

        if (banned) {
            alert('You are banned from voting!');
            return;
        }

        try {
            await handleThreadVote(threadId, newVote, userData.username);
            setUserVote(newVote);
            setFetchTrigger(!fetchTrigger);
        } catch (error) {
            console.error(`Error handling ${vote === 1 ? 'upvote' : 'downvote'}`, error);
        }
    };

    if (!thread) {
        return <div>Loading...</div>;
    }

    return (
        <div className="thread-container">
            <div className="thread-header">
                <h1>{thread.title}</h1>
                <p>Created At: {new Date(thread.createdAt).toLocaleDateString()}</p>
                {thread.updatedAt && <p>Last Edited: {new Date(thread.updatedAt).toLocaleDateString()}</p>}
                {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === thread.author)) && (
                    <div>
                        <button onClick={() => setEditMode(true)}>Edit Thread</button>
                        <button onClick={handleDeleteThread}>Delete Thread</button>
                    </div>
                )}
            </div>
            <div className="thread-body">
                <UserInfo userAuthor={userAuthor} />
                <div className="thread-content">
                    <p>{thread.content}</p>
                </div>
            </div>
            <div className="thread-actions">
                <div onClick={() => handleVote(1)} className={`upvote-button ${userVote === 1 ? 'active' : ''}`}>
                    <FaArrowAltCircleUp />
                </div>
                <span>Upvotes: {thread.upvotes ? thread.upvotes.length : 0}</span>
                <div onClick={() => handleVote(-1)} className={`downvote-button ${userVote === -1 ? 'active' : ''}`}>
                    <FaArrowAltCircleDown />
                </div>
                <span>Downvotes: {thread.downvotes ? thread.downvotes.length : 0}</span>
                <FaEye />
                <span>Views: {thread.views || 0}</span>
            </div>

            {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === thread.author)) && editMode && (
                <div className="thread-edit">
                    <input
                        type="text"
                        value={editThreadTitle}
                        onChange={(e) => setEditThreadTitle(e.target.value)}
                        placeholder="Edit thread title"
                    />
                    <textarea
                        value={editThreadContent}
                        onChange={(e) => setEditThreadContent(e.target.value)}
                        placeholder="Edit thread content"
                    />
                    <button onClick={handleEditThread}>Save Changes</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                </div>
            )}

            <Replies threadId={threadId} />
        </div>
    );
}
