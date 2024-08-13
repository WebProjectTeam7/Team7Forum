import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../state/app.context';
import PropTypes from 'prop-types';
import { updateReply, deleteReply, reportReply, uploadReplyImages } from '../services/reply.service';
import { removeReplyIdFromThread } from '../services/thread.service';
import { getUserByUsername } from '../services/users.service';
import { MAX_FILE_SIZE, MAX_IMAGES } from '../common/views.constants';
import UserRoleEnum from '../common/role.enum';
import UserInfo from './UserInfo';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';
import VoteButtons from './VoteButtons';
import './CSS/Replies.css';
import { REPORT_REASON_LENGTH } from '../common/components.constants';
import CustomFileInput from '../components/CustomFileInput';
import Swal from 'sweetalert2';

const Reply = ({ reply, threadId, fetchReplies }) => {
    const { userData } = useContext(AppContext);
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState(reply.content);
    const [attachedImages, setAttachedImages] = useState(reply.imagesUrls || []);
    const [imageErrors, setImageErrors] = useState([]);
    const [userAuthor, setUserAuthor] = useState({});

    const fetchUserAuthor = async (username) => {
        try {
            const user = await getUserByUsername(username);
            setUserAuthor(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            Swal.fire('Error', 'An error occurred while fetching user details. Please try again later.', 'error'); // SweetAlert2 for user alerts
        }
    };

    useEffect(() => {
        fetchUserAuthor(reply.author);
    }, [reply.author]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [];
        const errors = [];

        if (attachedImages.length + files.length > MAX_IMAGES) {
            errors.push(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        }

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`The file ${file.name} is too large.`);
            } else {
                newImages.push(file);
            }
        });

        setImageErrors(errors);
        setAttachedImages((prevImages) => [...prevImages, ...newImages].slice(0, MAX_IMAGES));
    };

    const handleRemoveImage = (index) => {
        setAttachedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleEditReply = async (replyId) => {
        if (editReplyContent.trim() || attachedImages.length) {
            try {
                let imagesUrls = attachedImages.filter(img => typeof img === 'string');
                const newImages = attachedImages.filter(img => typeof img !== 'string');
                if (newImages.length > 0) {
                    const uploadedUrls = await uploadReplyImages(replyId, newImages);
                    imagesUrls = [...imagesUrls, ...uploadedUrls];
                }

                await updateReply(replyId, { content: editReplyContent, imagesUrls });
                setEditReplyId(null);
                setEditReplyContent('');
                fetchReplies();
            } catch (error) {
                console.error('Error editing reply:', error);
            }
        }
    };

    const handleDeleteReply = async (replyId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this reply!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await deleteReply(replyId);
                await removeReplyIdFromThread(threadId, replyId);
                fetchReplies();
            } catch (error) {
                console.error('Error deleting reply:', error);
            }
        }
    };

    const handleReportReply = async () => {
        const { value: reason } = await Swal.fire({
            title: 'Report Reply',
            input: 'textarea',
            inputPlaceholder: 'Enter the reason for reporting this reply',
            inputAttributes: {
                'aria-label': 'Enter the reason for reporting this reply',
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to enter a reason!';
                } else if (value.length > REPORT_REASON_LENGTH) {
                    return `The report reason must be ${REPORT_REASON_LENGTH} characters or less.`;
                }
            },
            confirmButtonText: 'Submit',
            showCancelButton: true,
        });

        if (reason) {
            try {
                await reportReply(reply.id, userData.username, reply.content, reason);
                Swal.fire('Reported', 'Reply reported successfully.', 'success');
            } catch (error) {
                console.error('Error reporting reply:', error);
            }
        }
    };

    let userVote = 0;
    if (userData) {
        if (reply.upvotes?.includes(userData.username)) {
            userVote = 1;
        } else if (reply.downvotes?.includes(userData.username)) {
            userVote = -1;
        }
    }

    return (
        <li className="reply-item">
            <div className="reply-body">
                <UserInfo userAuthor={userAuthor} />
                <div className="reply-content">
                    {editReplyId === reply.id ? (
                        <div className="reply-input">
                            <textarea
                                value={editReplyContent}
                                onChange={(e) => setEditReplyContent(e.target.value)}
                            />
                            <CustomFileInput onChange={handleImageChange} />
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
                                        <img
                                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                            alt={`Preview ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => handleRemoveImage(index)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => handleEditReply(reply.id)}>Save</button>
                            <button onClick={() => setEditReplyId(null)}>Cancel</button>
                        </div>
                    ) : (
                        <div className="reply-text">
                            <p>{reply.content}</p>
                            {reply.imagesUrls && reply.imagesUrls.length > 0 && (
                                <div className="images-previews">
                                    {reply.imagesUrls.map((url, index) => (
                                        <div key={index} className="images-preview">
                                            <img src={url} alt={`Reply Image ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="thread-dates">
                                Created At: {new Date(reply.createdAt).toLocaleString().slice(0, -3)}
                                {reply.updatedAt && (
                                    <> | Last Edited: {new Date(reply.updatedAt).toLocaleString().slice(0, -3)}</>
                                )}
                            </p>
                        </div>
                    )}
                    <div className="reply-actions">
                        <VoteButtons
                            itemId={reply.id}
                            itemType="reply"
                            fetchItem={fetchReplies}
                            initialUserVote={userVote}
                            upvotes={reply.upvotes?.length || 0}
                            downvotes={reply.downvotes?.length || 0}
                        />
                        <div className="edit-delete-report-buttons">
                            {userData && (
                                <button className="report-button" onClick={handleReportReply}>Report</button>
                            )}
                            {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === reply.author)) && (
                                <>
                                    <EditButton onClick={() => {
                                        setEditReplyId(reply.id);
                                        setEditReplyContent(reply.content);
                                        setAttachedImages(reply.imagesUrls || []);
                                    }} />
                                    <DeleteButton onClick={() => handleDeleteReply(reply.id)} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

Reply.propTypes = {
    reply: PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string,
        upvotes: PropTypes.arrayOf(PropTypes.string),
        downvotes: PropTypes.arrayOf(PropTypes.string),
        imagesUrls: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    threadId: PropTypes.string.isRequired,
    fetchReplies: PropTypes.func.isRequired,
};

export default Reply;
