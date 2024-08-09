import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { getUsersByUsername } from '../services/users.service'; // Import the service

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For navigation

    const handleSearch = async () => {
        if (searchQuery.trim() === '') {
            console.log('Search query is empty');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const allUsers = await getUsersByUsername(); // Fetch all users
            const filteredUsers = allUsers.filter(user =>
                user.username.toLowerCase().includes(searchQuery.trim().toLowerCase())
            );
            navigate('/search-results', { state: { results: filteredUsers } }); // Pass results to the results page
        } catch (err) {
            console.error('Error searching for users:', err);
            setError('Failed to fetch results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search by tag or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
