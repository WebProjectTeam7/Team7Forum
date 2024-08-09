import { useLocation } from 'react-router-dom';

export default function SearchResultPage() {
    const location = useLocation();
    const results = location.state?.results || [];

    return (
        <div>
            <h2>Search Results:</h2>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <ul>
                    {results.map((user) => (
                        <li key={user.key}>
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
            )}
        </div>
    );
}
