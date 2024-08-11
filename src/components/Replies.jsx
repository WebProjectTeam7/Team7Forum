import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../state/app.context';
import { createReply, getRepliesByThreadId, uploadReplyImages } from '../services/reply.service';
import { addReplyIdToThread } from '../services/thread.service';
import { isUserBanned } from '../services/admin.service';
import { MAX_FILE_SIZE, REPLIES_PER_PAGE, MAX_IMAGES } from '../common/views.constants';
import Reply from './Reply';
import Pagination from './Pagination';
import PropTypes from 'prop-types';
import './CSS/Replies.css';


export default function Replies({ threadId }) {
    const { userData } = useContext(AppContext);

    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [attachedImages, setAttachedImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageErrors, setImageErrors] = useState([]);

    useEffect(() => {
        fetchReplies();
    }, [currentPage]);

    const fetchReplies = async () => {
        try {
            const fetchedReplies = await getRepliesByThreadId(threadId);
            setReplies(fetchedReplies);
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [];
        const errors = [];

        if (files.length > MAX_IMAGES) {
            errors.push(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        }

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`The file ${file.name} is too large.`);
            } else {
                newImages.push(file);
            }
        });

        if (newImages.length > MAX_IMAGES) {
            newImages.splice(MAX_IMAGES);
        }

        setImageErrors(errors);
        setAttachedImages((prevImages) => [...prevImages, ...newImages].slice(0, MAX_IMAGES));
    };

    const handleRemoveImage = (index) => {
        setAttachedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleCreateReply = async () => {
        if (replyContent.trim() || attachedImages.length) {
            const banned = await isUserBanned(userData.uid);
            if (banned) {
                alert('You are banned from posting replies!');
                return;
            }
            try {
                let content = replyContent;
                let imageUrls = [];
                if (attachedImages.length) {
                    imageUrls = await uploadReplyImages(threadId, attachedImages);
                }
                const replyId = await createReply(threadId, userData.username, content, imageUrls);
                await addReplyIdToThread(threadId, replyId);

                setReplyContent('');
                setAttachedImages([]);
                fetchReplies();
            } catch (error) {
                console.error('Error creating reply:', error);
            }
        }
    };

    const startIndex = (currentPage - 1) * REPLIES_PER_PAGE;
    const paginatedReplies = replies.slice(startIndex, startIndex + REPLIES_PER_PAGE);
    const totalPages = Math.ceil(replies.length / REPLIES_PER_PAGE);

    return (
        <div className="replies-container">
            <h2>Replies</h2>
            <ul className="replies">
                {paginatedReplies.map((reply) => (
                    <Reply key={reply.id} reply={reply} threadId={threadId} fetchReplies={fetchReplies} />
                ))}
            </ul>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
            {userData && (
                <div className="reply-input">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Add a reply"
                        rows="4"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        multiple
                    />
                    {imageErrors.length > 0 && (
                        <div className="image-errors">
                            {imageErrors.map((error, index) => (
                                <p key={index} className="error-message">{error}</p>
                            ))}
                        </div>
                    )}
                    <div className="image-previews">
                        {attachedImages.map((image, index) => (
                            <div key={index} className="image-preview">
                                <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                                <button type="button" onClick={() => handleRemoveImage(index)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleCreateReply}>Add Reply</button>
                </div>
            )}
        </div>
    );
}

Replies.propTypes = {
    threadId: PropTypes.string.isRequired,
};
