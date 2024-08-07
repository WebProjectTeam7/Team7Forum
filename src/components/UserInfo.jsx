import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const UserInfo = ({ userAuthor }) => {
    const navigate = useNavigate();

    const handleNavigate = (e) => {
        e.preventDefault();
        navigate(`/user-profile/${userAuthor.username}`);
    };

    return (
        <div className="reply-info">
            <img src={(userAuthor && userAuthor.avatar) || '/src/image/default-profile.png'} alt="Author Avatar" className="author-avatar" />
            <div className="reply-author-date">
                <p>Author: <a href={`/user-profile/${userAuthor.username}`} onClick={handleNavigate}>{(userAuthor && userAuthor.username) || ''}</a></p>
                <p>Role: {(userAuthor && userAuthor.role) || ''}</p>
                <p>Member since: {userAuthor && new Date(userAuthor.createdOn).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

UserInfo.propTypes = {
    userAuthor: PropTypes.shape({
        avatar: PropTypes.string,
        username: PropTypes.string,
        role: PropTypes.string,
        createdOn: PropTypes.string,
    }),
};

export default UserInfo;
