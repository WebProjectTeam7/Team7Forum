import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThreadsByCategoryId, createThread } from '../services/thread.service';
import { createThreadTag } from '../services/tag.service';
import { AppContext } from '../state/app.context';
import UserRoleEnum from '../common/role.enum';
import { getCategoryById, updateThreadsCounter } from '../services/category.service';
import './CSS/Category.css';
import ThreadItem from '../components/ThreadItem';
import { isUserBanned } from '../services/users.service';
import InfoButton from '../components/InfoButton';
import { CONTENT_REGEX, TITLE_REGEX } from '../common/regex';

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
            const banned = await isUserBanned(userData.uid);

            if (banned) {
                alert('You are banned from creating threads!');
                return;
            }

            const alertArr = [];

            if (!TITLE_REGEX.test(newThreadTitle)) {
                alertArr.push('Invalid title length, must be between 3 and 64 characters!');
            }

            if (!CONTENT_REGEX.test(newThreadContent)) {
                alertArr.push('Invalid content length, must be between 3 and 8192 characters!');
            }

            if (alertArr.length > 0) {
                alert(alertArr.join('\n'));
                return;
            }

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
                        <ThreadItem key={thread.id} thread={thread} />
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
                                <InfoButton text="Title must be:
                               between 3 to 64 characters,"/>
                                <input
                                    type="text"
                                    value={newThreadTitle}
                                    onChange={(e) => setNewThreadTitle(e.target.value)}
                                    placeholder="New thread title"
                                />
                                <InfoButton text="Content must be:
                               between 3 to 8192 characters,"/>
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
