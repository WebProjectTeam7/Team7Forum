import './CSS/SuccessModal.css';
import PropTypes from 'prop-types';

const SuccessModal = ({ message, image, onClose }) => {
    return (
        <div className="success-modal-overlay">
            <div className="success-modal">
                <img src={image} alt="Success" className="success-image" />
                <p>{message}</p>
                <button onClick={onClose} className="close-button">Close</button>
            </div>
        </div>
    );
};

SuccessModal.propTypes = {
    message: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SuccessModal;
