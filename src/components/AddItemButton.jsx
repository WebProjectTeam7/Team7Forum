import './CSS/AddItemButton.css';
import PropTypes from 'prop-types';

export default function AddItemButton ({ text, onClick  }) {
    return (
        <button type="button" className="add_item_button" onClick={onClick}>
            <span className="add_item_button__text">{text}</span>
            <span className="add_item_button__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" height="24" fill="none" className="svg">
                    <line y2="19" y1="5" x2="12" x1="12"></line>
                    <line y2="12" y1="12" x2="19" x1="5"></line>
                </svg>
            </span>
        </button>
    );
}

AddItemButton.propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};