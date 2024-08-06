import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadById, updateThread, deleteThread, handleThreadVote, incrementThreadViews } from '../services/thread.service';
import { AppContext } from '../state/app.context';
import Replies from '../components/Replies';
import UserRoleEnum from '../common/role.enum';
import './CSS/Thread.css';
import { FaArrowAltCircleDown, FaArrowAltCircleUp, FaEye } from 'react-icons/fa';

export default function Thread() {
    const { threadId } = useParams();
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editThreadTitle, setEditThreadTitle] = useState('');
    const [editThreadContent, setEditThreadContent] = useState('');
    const [userVote, setUserVote] = useState(0);

    useEffect(() => {
        const fetchThread = async () => {
            try {
                await incrementThreadViews(threadId);
                const fetchedThread = await getThreadById(threadId);
                setThread(fetchedThread);
                setEditThreadTitle(fetchedThread.title);
                setEditThreadContent(fetchedThread.content);

                const vote = fetchedThread.upvotes?.includes(userData.username) ? 1 :
                    fetchedThread.downvotes?.includes(userData.username) ? -1 : 0;
                setUserVote(vote);
            } catch (error) {
                console.error('Error fetching thread:', error);
            }
        };

        fetchThread();
    }, [threadId, userData]);

    const handleEditThread = async () => {
        try {
            const updatedData = { title: editThreadTitle, content: editThreadContent };
            await updateThread(threadId, updatedData);
            setThread({ ...thread, ...updatedData });
            setEditMode(false);
        } catch (error) {
            console.error('Error editing thread:', error);
        }
    };

    const handleDeleteThread = async () => {
        if (window.confirm('Are you sure you want to delete this thread?')) {
            try {
                await deleteThread(threadId);
                navigate('/forum');
            } catch (error) {
                console.error('Error deleting thread:', error);
            }
        }
    };

    const handleUpvote = async () => {
        const newVote = userVote === 1 ? 0 : 1;
        try {
            await handleThreadVote(threadId, newVote, userData.username);
            const updatedThread = await getThreadById(threadId);
            setThread(updatedThread);
            setUserVote(newVote);
        } catch (error) {
            console.error('Error handling upvote:', error);
        }
    };

    const handleDownvote = async () => {
        const newVote = userVote === -1 ? 0 : -1;
        try {
            await handleThreadVote(threadId, newVote, userData.username);
            const updatedThread = await getThreadById(threadId);
            setThread(updatedThread);
            setUserVote(newVote);
        } catch (error) {
            console.error('Error handling downvote:', error);
        }
    };

    if (!thread) {
        return <div>Loading...</div>;
    }

    return (
        <div className="thread-container">
            <div className="thread-header">
                <h1>{thread.title}</h1>
                {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === thread.author)) && (
                    <div>
                        <button onClick={() => setEditMode(true)}>Edit Thread</button>
                        <button onClick={handleDeleteThread}>Delete Thread</button>
                    </div>
                )}
            </div>
            <div className="thread-body">
                <div className="thread-info">
                    <img src={thread.authorAvatar} alt="Author Avatar" className="author-avatar" />
                    <div className="thread-author-date">
                        <p>Author: {thread.authorName}</p>
                        <p>Created At: {new Date(thread.createdAt).toLocaleDateString()}</p>
                        {thread.updatedAt && <p>Last Edited: {new Date(thread.updatedAt).toLocaleDateString()}</p>}
                    </div>
                </div>
                <div className="thread-content">
                    <p>{thread.content}</p>
                </div>
            </div>
            <div className="thread-actions">
                <button onClick={handleUpvote} className={`upvote-button ${userVote === 1 ? 'active' : ''}`}>
                    <FaArrowAltCircleUp />
                </button>
                <span>Upvotes: {thread.upvotes ? thread.upvotes.length : 0}</span>
                <button onClick={handleDownvote} className={`downvote-button ${userVote === -1 ? 'active' : ''}`}>
                    <FaArrowAltCircleDown />
                </button>
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
