import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadById, updateThread, deleteThread, handleThreadVote, incrementThreadViews, reportThread } from '../services/thread.service';
import {
    getThreadById,
    updateThread,
    deleteThread,
    handleThreadVote,
    incrementThreadViews
} from '../services/thread.service';
import { AppContext } from '../state/app.context';
import Replies from '../components/Replies';
import UserRoleEnum from '../common/role.enum';
import { FaArrowAltCircleDown, FaArrowAltCircleUp, FaEye } from 'react-icons/fa';
import './CSS/Thread.css';
import { getUserByUsername, isUserBanned } from '../services/users.service';
import UserInfo from '../components/UserInfo';
import { removeThreadIdFromCategory } from '../services/category.service';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import { CONTENT_REGEX, TITLE_REGEX } from '../common/regex';
import { createOrUpdateThreadTag, getThreadsIdsByTag, removeThreadIdFromTag } from '../services/tag.service';

export default function Thread() {
    const { threadId } = useParams();
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editThreadTitle, setEditThreadTitle] = useState('');
    const [editThreadContent, setEditThreadContent] = useState('');
    const [editThreadTags, setEditThreadTags] = useState('');
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
            setFetchTrigger(prev => !prev);
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
            setEditThreadTags(fetchedThread.tags ? fetchedThread.tags.join(', ') : '');
            fetchUserAuthor(fetchedThread.authorName);

            if (userData) {
                const vote = fetchedThread.upvotes?.includes(userData.username) ? 1 :
                    fetchedThread.downvotes?.includes(userData.username) ? -1 : 0;
                setUserVote(vote);
            }
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

    const handleTagClick = async (tag) => {
        const result = { threads: [], users: [] };
        try {
            const threadsIds = await getThreadsIdsByTag(tag);
            const threads = await Promise.all(threadsIds.map(id => getThreadById(id)));
            result.threads = threads.filter(thread => !!thread);
            navigate('/search-results', { state: { results: result } });
        } catch (error) {
            console.error('Error fetching threads by tag:', error);
        }
    };

    const handleEditThread = async () => {
        const alertArr = [];

        if (!TITLE_REGEX.test(editThreadTitle)) {
            alertArr.push('Invalid title length, must be between 3 and 64 characters!');
        }

        if (!CONTENT_REGEX.test(editThreadContent)) {
            alertArr.push('Invalid content length, must be between 3 and 8192 characters!');
        }

        if (alertArr.length > 0) {
            alert(alertArr.join('\n'));
            return;
        }

        try {
            const updatedData = {
                title: editThreadTitle,
                content: editThreadContent,
                tags: [...new Set(editThreadTags.split(',')
                    .map(tag => tag.toLowerCase().trim())
                    .filter(tag => tag.length > 0))],
            };

            await updateThread(threadId, updatedData);

            if (updatedData.tags.length > 0) {
                await Promise.all(updatedData.tags.map(tag => createOrUpdateThreadTag(tag, threadId)));
            }

            if (thread.tags) {
                const tagsToRemove = thread.tags.filter(tag => !updatedData.tags.includes(tag));
                await Promise.all(tagsToRemove.map(tag => removeThreadIdFromTag(tag, threadId)));
            }

            setEditMode(false);
            setFetchTrigger(prev => !prev);
        } catch (error) {
            console.error('Error editing thread:', error);
            alert('An error occurred while editing the thread. Please try again.');
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

        try {
            const banned = await isUserBanned(userData.uid);
            if (banned) {
                alert('You are banned from voting!');
                return;
            }

            await handleThreadVote(threadId, newVote, userData.username);
            setUserVote(newVote);
            setFetchTrigger(prev => !prev);
        } catch (error) {
            console.error(`Error handling ${vote === 1 ? 'upvote' : 'downvote'}`, error);
        }
    };

    const handleReportThread = async () => {
        const reason = prompt('Please enter the reason for reporting this thread:');
        if (reason) {
            try {
                await reportThread(threadId, userData.username, thread.content, reason);
                alert('Thread reported successfully.');
            } catch (error) {
                console.error('Error reporting thread:', error);
            }
        }
    };

    if (!thread) {
        return <div>Loading...</div>;
    }

    return (
        <div className="thread-container">
            <div className="thread-header">
                {editMode ? (
                    <input
                        type="text"
                        value={editThreadTitle}
                        onChange={(e) => setEditThreadTitle(e.target.value)}
                        placeholder="Edit thread title"
                    />
                ) : (
                    <h1>{thread.title}</h1>
                )}
                <p className="thread-dates">
                    Created At: {new Date(thread.createdAt).toLocaleDateString()}
                    {thread.updatedAt && (
                        <> | Last Edited: {new Date(thread.updatedAt).toLocaleDateString()}</>
                    )}
                </p>
                {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === thread.author)) && (
                    <div className="button-container">
                        <EditButton onClick={() => setEditMode(true)} />
                        <DeleteButton onClick={handleDeleteThread} />
                    </div>
                )}
            </div>
            <div className="thread-body">
                <UserInfo userAuthor={userAuthor} />
                <div className="thread-content">
                    {editMode ? (
                        <textarea
                            value={editThreadContent}
                            onChange={(e) => setEditThreadContent(e.target.value)}
                            placeholder="Edit thread content"
                        />
                    ) : (
                        <p>{thread.content}</p>
                    )}
                </div>
            </div>
            <div className="thread-actions">
                <div
                    onClick={userData ? () => handleVote(1) : null}
                    className={`vote-button upvote-button ${userVote === 1 ? 'active' : ''}`}
                >
                    <FaArrowAltCircleUp />
                </div>
                <span>Upvotes: {thread.upvotes?.length || 0}</span>
                <div
                    onClick={userData ? () => handleVote(-1) : null}
                    className={`vote-button downvote-button ${userVote === -1 ? 'active' : ''}`}
                >
                    <FaArrowAltCircleDown />
                </div>
                <span>Downvotes: {thread.downvotes ? thread.downvotes.length : 0}</span>
                <FaEye />
                <span>Views: {thread.views || 0}</span>
                {userData && (
                    <button onClick={handleReportThread}>Report</button>
                )}
                <span>Downvotes: {thread.downvotes?.length || 0}</span>
                <div className="views">
                    <FaEye />
                    <span>Views: {thread.views || 0}</span>
                </div>
            </div>
            <div className="thread-tags">
                {editMode ? (
                    <input
                        type="text"
                        value={editThreadTags}
                        onChange={(e) => setEditThreadTags(e.target.value)}
                        placeholder="Edit tags (comma-separated)"
                    />
                ) : (
                    <p>
                        <strong>Tags:</strong>
                        {thread.tags && thread.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="tag-link"
                                onClick={() => handleTagClick(tag)}
                            >
                                {tag}{index < thread.tags.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                    </p>
                )}
            </div>
            {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === thread.author)) && editMode && (
                <div className="thread-edit">
                    <button onClick={handleEditThread}>Save Changes</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                </div>
            )}
            <Replies threadId={threadId} />
        </div>
    );
}