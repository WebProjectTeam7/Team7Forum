import { useState } from 'react';
import './CSS/UpvoteDownvote.css';

export default function UpvoteDownvote({ parentComponentId, handleVote, username }) {
    const [votes, setVotes] = useState(0);
    const [userVote, setUserVote] = useState(null); // null: no vote, 1: upvote, -1: downvote

    const handleUpvote =
        async () => {
            const newVote = userVote === 1 ? 0 : 1;
            const delta = newVote - (userVote || 0);

            try {
                await handleVote(parentComponentId, delta, username);
                setVotes(votes + delta);
                setUserVote(newVote);
            } catch (error) {
                console.error('Error handling upvote:', error);
            }
        };

    const handleDownvote = async () => {
        const newVote = userVote === -1 ? 0 : -1;
        const delta = newVote - (userVote || 0);

        try {
            await handleVote(parentComponentId, delta, username);
            setVotes(votes + delta);
            setUserVote(newVote);
        } catch (error) {
            console.error('Error handling downvote:', error);
        }
    };

    return (
        <div className="upvote-downvote">
            <button onClick={handleUpvote} className={`upvote-button ${userVote === 1 ? 'active' : ''}`}>
                Upvote
            </button>
            <span>{votes}</span>
            <button onClick={handleDownvote} className={`downvote-button ${userVote === -1 ? 'active' : ''}`}>
                Downvote
            </button>
        </div>
    );
}