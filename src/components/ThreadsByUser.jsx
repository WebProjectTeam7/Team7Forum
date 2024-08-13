import { useEffect, useState } from 'react';
import ThreadItem from '../components/ThreadItem';
import './CSS/Category.css';


export default function Home() {
    const [threadsByUser, setThreadsByUser] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            setLoading(true);
            const fetchedThreads = await getThreadsByUser(username);
            setThreadsByUser(fetchedThreads);
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-container">
            <h1>Threads by User</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul className="threads">
                    {threadsByUser.length > 0 ? (
                        threadsByUser.map((thread) => (
                            <ThreadItem key={thread.id} thread={thread} />
                        ))
                    ) : (
                        <li>No threads available</li>
                    )}
                </ul>
            )}
        </div>
    );
}
