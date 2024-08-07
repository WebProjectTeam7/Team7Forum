/* eslint-disable func-style */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../components/CSS/Notification.css';
import welcomeGif from '../image/welcome.gif';

function WelcomeGifNotification({ show, onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    // eslint-disable-next-line consistent-return
    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 7000);

            return () => clearTimeout(timer);
        }

        setIsVisible(false);
    }, [show, onClose]);

    return (
        <div className={`gift-animation ${isVisible ? 'show' : ''}`}>
            {isVisible && <img src={welcomeGif} alt="Welcome!" />}
        </div>
    );
}

WelcomeGifNotification.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default WelcomeGifNotification;
