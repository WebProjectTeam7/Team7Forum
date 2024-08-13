import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from 'react-icons/fa';
import { AppContext } from '../state/app.context';
import { handleThreadVote } from '../services/thread.service';
import { handleReplyVote } from '../services/reply.service';
import { isUserBanned } from '../services/admin.service';
import Swal from 'sweetalert2';

const VoteButtons = ({ itemId, itemType, fetchItem, initialUserVote, upvotes, downvotes }) => {
    const { userData } = useContext(AppContext);
    const [userVote, setUserVote] = useState(initialUserVote);

    const handleVote = async (vote) => {
        if (!userData) {
            Swal.fire('Login Required', 'You need to be logged in to vote.', 'info');
            return;
        }

        const newVote = userVote === vote ? 0 : vote;
        try {
            const banned = await isUserBanned(userData.uid);
            if (banned) {
                Swal.fire('Banned', 'You are banned from voting!', 'warning');
                return;
            }
            if (itemType === 'thread') {
                await handleThreadVote(itemId, newVote, userData.username);
            } else if (itemType === 'reply') {
                await handleReplyVote(itemId, newVote, userData.username);
            }
            setUserVote(newVote);
            fetchItem();
        } catch (error) {
            console.error(`Error handling ${vote === 1 ? 'upvote' : 'downvote'}`, error);
        }
    };

    return (
        <div className="upvote-downvote">
            <div
                onClick={() => handleVote(1)}
                className={`vote-button upvote-button ${userVote === 1 ? 'active' : ''}`}
            >
                <FaArrowAltCircleUp />
            </div>
            <span>Upvotes: {upvotes}</span>
            <div
                onClick={() => handleVote(-1)}
                className={`vote-button downvote-button ${userVote === -1 ? 'active' : ''}`}
            >
                <FaArrowAltCircleDown />
            </div>
            <span>Downvotes: {downvotes}</span>
        </div>
    );
};

VoteButtons.propTypes = {
    itemId: PropTypes.string.isRequired,
    itemType: PropTypes.oneOf(['thread', 'reply']).isRequired,
    fetchItem: PropTypes.func.isRequired,
    initialUserVote: PropTypes.number.isRequired,
    upvotes: PropTypes.number.isRequired,
    downvotes: PropTypes.number.isRequired,
};

export default VoteButtons;
