import PropTypes from 'prop-types';
import './CSS/Modal.css';

const Modal = ({ isVisible, onClose, message, gifUrl }) => {
    if (!isVisible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <img src={gifUrl} alt="Notification" className="modal-gif" />
                <p>{message}</p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    gifUrl: PropTypes.string.isRequired,
};

export default Modal;
