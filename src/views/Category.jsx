import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThreadsByCategoryId, createThread, deleteThread } from '../services/thread.service';
import { AppContext } from '../state/app.context';
import UserRoleEnum from '../common/role.enum';

export default function Category() {
    const { categoryId } = useParams();
    const { user, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === UserRoleEnum.ADMIN;

    const [threads, setThreads] = useState([]);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const fetchedThreads = await getThreadsByCategoryId(categoryId);
                setThreads(fetchedThreads);
            } catch (error) {
                console.error('Error fetching threads:', error);
            }
        };

        fetchThreads();
    }, [categoryId]);

    const handleCreateThread = () => {
        if (newThreadTitle.trim() && newThreadContent.trim()) {
            createThread(categoryId, newThreadTitle, newThreadContent, user.uid, userData.username)
                .then(() => {
                    setThreads([...threads, { title: newThreadTitle, content: newThreadContent }]);
                    setNewThreadTitle('');
                    setNewThreadContent('');
                })
                .catch((error) => console.error('Error creating thread:', error));
        }
    };

    const handleDeleteThread = (threadId) => {
        if (window.confirm('Are you sure you want to delete this thread?')) {
            deleteThread(threadId)
                .then(() => {
                    setThreads(threads.filter(thread => thread.id !== threadId));
                })
                .catch((error) => console.error('Error deleting thread:', error));
        }
    };

    return (
        <div>
            <h1>Category {categoryId}</h1>
            {isAdmin && (
                <div>
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
                    <button onClick={handleCreateThread}>Create Thread</button>
                </div>
            )}
            <ul>
                {threads.length > 0 ? (
                    threads.map((thread) => (
                        <li key={thread.id}>
                            <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                            {isAdmin && (
                                <button onClick={() => handleDeleteThread(thread.id)}>Delete</button>
                            )}
                        </li>
                    ))
                ) : (
                    <li>No threads available</li>
                )}
            </ul>
        </div>
    );
}
