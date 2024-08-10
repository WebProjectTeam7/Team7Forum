import { useLocation } from 'react-router-dom';
import ThreadItem from '../components/ThreadItem';
import UserInfo from '../components/UserInfo';

export default function SearchResultPage() {
    const location = useLocation();
    const results = location.state?.results || {
        threads: [],
        users: [],
    };

    const noResultsFound = results.threads.length === 0 && results.users.length === 0;

    return (
        <div>
            <h2>Search Results:</h2>
            {noResultsFound ? (
                <p>No results found.</p>
            ) : (
                <>
                    {results.users.length > 0 && (
                        <div>
                            <h3>User Results:</h3>
                            <ul>
                                {results.users.map((user) => (
                                    <li key={user.uid}>
                                        <UserInfo key={user.uid} userAuthor={user} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.threads.length > 0 && (
                        <div>
                            <h3>Thread Results:</h3>
                            <ul>
                                {results.threads.map((thread) => (
                                    <li key={thread.id}>
                                        <ThreadItem key={thread.id} thread={thread} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
