import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThreadsByCategoryId, createThread } from '../services/thread.service';
import { createThreadTag } from '../services/tag.service';
import { AppContext } from '../state/app.context';
import UserRoleEnum from '../common/role.enum';
import { getCategoryById, updateThreadsCounter } from '../services/category.service';
import './CSS/Category.css';

export default function Category() {
    const { categoryId } = useParams();
    const { user, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === UserRoleEnum.ADMIN;

    const [threads, setThreads] = useState([]);
    const [category, setCategory] = useState(null);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newThreadTags, setNewThreadTags] = useState('');
    const [showCreateThread, setShowCreateThread] = useState(false);
    const [fetchTrigger, setFetchTrigger] = useState(false);

    useEffect(() => {
        fetchThreads();
    }, [fetchTrigger]);

    const fetchThreads = async () => {
        try {
            const fetchedCategory = await getCategoryById(categoryId);
            setCategory(fetchedCategory);
            const fetchedThreads = await getThreadsByCategoryId(categoryId);
            setThreads(fetchedThreads);
        } catch (error) {
            console.error('Error fetching threads:', error);
        }
    };

    const handleCreateThread = async () => {
        if (newThreadTitle.trim() && newThreadContent.trim()) {
            try {
                const newThreadId = await createThread(categoryId, newThreadTitle, newThreadContent, user.uid, userData.username);
                await updateThreadsCounter(categoryId, 1);
                const tagsArray = newThreadTags.split(',').filter(tag => tag.trim().length > 0);
                await Promise.all(tagsArray.map(tag => createThreadTag(tag.trim(), newThreadId)));

                setFetchTrigger(!fetchTrigger);
                setNewThreadTitle('');
                setNewThreadContent('');
                setNewThreadTags('');
                setShowCreateThread(false);
            } catch (error) {
                console.error('Error creating thread:', error);
            }
        }
    };

    return (
        <div className="category-container">
            <h1>{category?.title || 'Loading...'}</h1>
            <ul className="threads">
                {threads.length > 0 ? (
                    threads.map((thread) => (
                        <li key={thread.id} className="thread-item">
                            <div className="thread-info">
                                <img src="/path/to/thread/image.jpg" alt="Thread" className="thread-image" />
                                <div>
                                    <p className="thread-author">{thread.author}</p>
                                    <p className="thread-date">Created on: {new Date(thread.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="thread-content">
                                <h3>
                                    <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                                </h3>
                                <p>{thread.content.substring(0, 100)}...</p>
                                <div className="thread-stats">
                                    <span>Replies: {thread.repliesCount}</span>
                                    <span>Upvotes: {thread.upvotes && thread.upvotes.length || 0}</span>
                                    <span>Downvotes: {thread.downvotes && thread.downvotes.length || 0}</span>
                                    <span>Views: {thread.views}</span>
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li>No threads available</li>
                )}
                {isAdmin && (
                    <div className="admin-actions">
                        <button onClick={() => setShowCreateThread(!showCreateThread)}>
                            {showCreateThread ? 'Cancel' : 'Create Thread'}
                        </button>
                        {showCreateThread && (
                            <div className="create-thread">
                                <input
                                    type="text"
                                    value={newThreadTitle}
                                    onChange={(e) => setNewThreadTitle(e.target.value)}
                                    placeholder="New thread title"
                                />
                                <textarea
                                    value={newThreadContent}
                                    onChange={(e) => setNewThreadContent(e.target.value)}
                                    placeholder="New thread content"
                                />
                                <input
                                    type="text"
                                    value={newThreadTags}
                                    onChange={(e) => setNewThreadTags(e.target.value)}
                                    placeholder="Tags (comma-separated)"
                                />
                                <button onClick={handleCreateThread}>Save Thread</button>
                            </div>
                        )}
                    </div>
                )}
            </ul>
        </div>
    );
}
