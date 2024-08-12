/* eslint-disable max-len */
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../state/app.context';
import { getThreadById, updateThread, deleteThread, incrementThreadViews, reportThread, uploadThreadImages } from '../services/thread.service';
import { createOrUpdateThreadTag, getThreadsIdsByTag, removeThreadIdFromTag } from '../services/tag.service';
import { getUserByUsername } from '../services/users.service';
import { removeThreadIdFromCategory } from '../services/category.service';
import { CONTENT_REGEX, TITLE_REGEX } from '../common/regex';
import { FaEye } from 'react-icons/fa';
import UserRoleEnum from '../common/role.enum';
import Replies from '../components/Replies';
import UserInfo from '../components/UserInfo';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import VoteButtons from '../components/VoteButtons';
import './CSS/Thread.css';
import { MAX_FILE_SIZE, MAX_IMAGES } from '../common/views.constants';

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
    const [attachedImages, setAttachedImages] = useState([]);
    const [imageErrors, setImageErrors] = useState([]);


    const incrementViews = async () => {
        try {
            await incrementThreadViews(threadId);
            fetchThread();
        } catch (error) {
            console.error('Error incrementing thread views:', error);
        }
    };

    useEffect(() => {
        incrementViews();
    }, []);

    const fetchThread = async () => {
        try {
            const fetchedThread = await getThreadById(threadId);
            setThread(fetchedThread);
            setEditThreadTitle(fetchedThread.title);
            setEditThreadContent(fetchedThread.content);
            setEditThreadTags(fetchedThread.tags ? fetchedThread.tags.join(', ') : '');
            fetchUserAuthor(fetchedThread.authorName);
            setAttachedImages(fetchedThread.imagesUrls || []);
            if (userData) {
                const vote = fetchedThread.upvotes?.includes(userData.username) ? 1 :
                    fetchedThread.downvotes?.includes(userData.username) ? -1 : 0;
                setUserVote(vote);
            }
        } catch (error) {
            console.error('Error fetching thread:', error);
        }
    };

    useEffect(() => {
        fetchThread();
    }, [threadId]);

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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [];
        const errors = [];

        if (attachedImages.length + files.length > MAX_IMAGES) {
            errors.push(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        }

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`The file ${file.name} is too large.`);
            } else {
                newImages.push(file);
            }
        });

        setImageErrors(errors);
        setAttachedImages((prevImages) => [...prevImages, ...newImages].slice(0, MAX_IMAGES));
    };

    const handleRemoveImage = (index) => {
        setAttachedImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
            let imagesUrls = attachedImages.filter(img => typeof img === 'string');
            const newImages = attachedImages.filter(img => typeof img !== 'string');
            if (newImages.length > 0) {
                const uploadedUrls = await uploadThreadImages(threadId, newImages);
                imagesUrls = [...imagesUrls, ...uploadedUrls];
            }
            const updatedData = {
                title: editThreadTitle,
                content: editThreadContent,
                tags: [...new Set(editThreadTags.split(',')
                    .map(tag => tag.toLowerCase().trim())
                    .filter(tag => tag.length > 0))],
                imagesUrls,
            };
            await updateThread(threadId, updatedData);
            if (updatedData.tags.length > 0) {
                await Promise.all(updatedData.tags.map(tag => createOrUpdateThreadTag(tag, threadId)));
            }
            if (thread.tags) {
                const tagsToRemove = thread.tags.filter(tag => !updatedData.tags.includes(tag));
                await Promise.all(tagsToRemove.map(tag => removeThreadIdFromTag(tag, threadId)));
            }
            setImageErrors([]);
            setEditMode(false);
            fetchThread();
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
                    Created At: {new Date(thread.createdAt).toLocaleString().slice(0, -3)}
                    {thread.updatedAt && (
                        <> | Last Edited: {new Date(thread.updatedAt).toLocaleString().slice(0, -3)}</>
                    )}
                </p>

                <div className="button-container">
                    {userData && (
                        <button onClick={handleReportThread}>Report</button>
                    )}
                    {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === thread.author)) && (
                        <>
                            <EditButton onClick={() => setEditMode(true)} />
                            <DeleteButton onClick={handleDeleteThread} />
                        </>
                    )}
                </div>
            </div>
            <div className="thread-body">
                <UserInfo userAuthor={userAuthor} />
                <div className="thread-content">
                    {editMode ? (
                        <div className="thread-input">
                            <textarea
                                value={editThreadContent}
                                onChange={(e) => setEditThreadContent(e.target.value)}
                                placeholder="Edit thread content"
                            />
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {imageErrors.length > 0 && (
                                <div className="image-errors">
                                    {imageErrors.map((error, index) => (
                                        <p key={index} className="error-message">{error}</p>
                                    ))}
                                </div>
                            )}
                            <div className="image-previews">
                                {attachedImages.map((image, index) => (
                                    <div key={index} className="image-preview">
                                        <img src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                            alt={`Preview ${index + 1}`} />
                                        <button onClick={() => handleRemoveImage(index)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="thread-text">
                            <p>{thread.content}</p>
                            {thread.imagesUrls && thread.imagesUrls.map((url, index) => (
                                <div key={index} className="images-preview">
                                    <img src={url} alt={`Thread Image ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="thread-actions">
                <VoteButtons
                    itemId={threadId}
                    itemType="thread"
                    fetchItem={fetchThread}
                    initialUserVote={userVote}
                    upvotes={thread.upvotes?.length || 0}
                    downvotes={thread.downvotes?.length || 0}
                />
                <FaEye />
                <span>Views: {thread.views || 0}</span>
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
            {
                (userData && (userData.role === UserRoleEnum.ADMIN || userData.username === thread.author)) && editMode && (
                    <div className="thread-edit">
                        <button onClick={handleEditThread}>Save Changes</button>
                        <button onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                )
            }
            <Replies threadId={threadId} />
        </div>
    );
}
