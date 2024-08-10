import { useLocation } from 'react-router-dom';
import ThreadItem from '../components/ThreadItem';

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
                                    <li key={user.id}>
                                        <div>
                                            <strong>Username:</strong> {user.username}
                                        </div>
                                        <div>
                                            <strong>First Name:</strong> {user.firstName}
                                        </div>
                                        <div>
                                            <strong>Last Name:</strong> {user.lastName}
                                        </div>
                                        <div>
                                            <strong>Email:</strong> {user.email}
                                        </div>
                                        <div>
                                            <strong>Avatar:</strong>
                                            <img src={user.avatar} alt={`${user.username}'s avatar`} width="50" height="50" />
                                        </div>
                                        <div>
                                            <strong>Role:</strong> {user.role}
                                        </div>
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
