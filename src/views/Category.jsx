import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThreadsByCategoryId, createThread, deleteThread } from '../services/thread.service';
import { AppContext } from '../state/app.context';
import UserRoleEnum from '../common/role.enum';
import './CSS/Category.css';
import { getCategoryById } from '../services/category.service';

export default function Category() {
    const { categoryId } = useParams();
    const { user, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === UserRoleEnum.ADMIN;

    const [threads, setThreads] = useState([]);
    const [category, setCategory] = useState(null);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [showCreateThread, setShowCreateThread] = useState(false);

    useEffect(() => {
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

        fetchThreads();
    }, [categoryId, setThreads]);

    const handleCreateThread = () => {
        if (newThreadTitle.trim() && newThreadContent.trim()) {
            createThread(categoryId, newThreadTitle, newThreadContent, user.uid, userData.username)
                .then(() => {
                    setThreads([...threads, { title: newThreadTitle, content: newThreadContent }]);
                    setNewThreadTitle('');
                    setNewThreadContent('');
                    setShowCreateThread(false);
                })
                .catch((error) => console.error('Error creating thread:', error));
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
                                    <span>Replies: {thread.replies && thread.replies.length}</span>
                                    <span>Upvotes: {thread.upvotes && thread.upvotes.length}</span>
                                    <span>Downvotes: {threads.downvotes && thread.downvotes.length}</span>
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
                                <button onClick={handleCreateThread}>Save Thread</button>
                            </div>
                        )}
                    </div>
                )}
            </ul>
        </div>
    );
}
