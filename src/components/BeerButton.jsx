import './CSS/BeerButton.css';
import PropTypes from 'prop-types';

export default function Button ({ text, onClick }) {
    return (
        <button onClick={onClick} className="beer-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path
                    style={{ fill: '#363636' }}
                    d="M17.1,21a1,1,0,0,1-1-.945C16.036,18.754,16,17.39,16,16a1,1,0,0,1,2,0c0,1.354.035,2.681.1,3.945A1,1,0,0,1,17.159,21,.5.5,0,0,1,17.1,21Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M46.9,21a.5.5,0,0,1-.055,0,1,1,0,0,1-.945-1.053c.069-1.264.1-2.591.1-3.945a1,1,0,0,1,2,0c0,1.39-.036,2.754-.106,4.055A1,1,0,0,1,46.9,21Z"
                ></path>
                <path
                    style={{ fill: '#ffbd4a' }}
                    d="M47.544,24.117A1,1,0,0,0,46.551,23H43a4.005,4.005,0,0,1-.28,1,1.994,1.994,0,0,1-2.056.973A1.947,1.947,0,0,1,39.3,24a3.786,3.786,0,0,1-.3-1H17.449a1,1,0,0,0-.993,1.117A57.092,57.092,0,0,0,19.546,37c.388,0,.732-.009,1.048-.029L20.6,37h4.9a2.5,2.5,0,0,1,0,5,2.5,2.5,0,0,1,0,5,2.5,2.5,0,0,1,0,5H24.3a2.145,2.145,0,0,0-1.515,0h-.038v.01a6.155,6.155,0,0,1-1.029.2,50.273,50.273,0,0,1-1.024,6.1A3,3,0,0,0,23.611,62H40.389a3,3,0,0,0,2.92-3.685A50.2,50.2,0,0,1,42,47c0-3.026.921-5.641,1.988-8.668a.975.975,0,0,0,.05-.324A9.1,9.1,0,0,1,43.045,38H38a3,3,0,0,1,0-6h6.987c.006-.023.012-.048.018-.07.306.036.639.055,1.016.062A54.206,54.206,0,0,0,47.544,24.117Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M19.421,11a.981.981,0,0,1-.4-.084A1,1,0,0,1,18.506,9.6,6,6,0,0,1,24,6a5.742,5.742,0,0,1,1.58.222A6.99,6.99,0,0,1,37.426,4.585,5.939,5.939,0,0,1,40,4a6.006,6.006,0,0,1,6,6,1,1,0,0,1-2,0,3.991,3.991,0,0,0-6.29-3.271,1,1,0,0,1-1.43-.3,4.991,4.991,0,0,0-9.121,1.344,1,1,0,0,1-1.41.652A3.993,3.993,0,0,0,20.338,10.4,1,1,0,0,1,19.421,11Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M47,17a1,1,0,0,1-1-1,1,1,0,0,0-1-1h-.17a.831.831,0,0,0-.83.83,1,1,0,0,1-2,0A2.834,2.834,0,0,1,44.83,13H45a3,3,0,0,1,3,3A1,1,0,0,1,47,17Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M32,20c-.071,0-.143,0-.215,0A4.089,4.088,0,0,1,28,15.83a.831.831,0,0,0-.83-.83H19a1,1,0,0,0-1,1,1,1,0,0,1-2,0,3,3,0,0,1,3-3h8.17A2.834,2.834,0,0,1,30,15.83,2.118,2.118,0,0,0,31.891,18,2,2,0,0,0,34,16a3,3,0,0,1,6,0,1,1,0,0,1-2,0,1,1,0,0,0-2,0,4.017,4.017,0,0,1-1.246,2.9A3.968,3.968,0,0,1,32,20Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M25.5,43h-5a3.5,3.5,0,0,1,0-7h5a3.5,3.5,0,0,1,0,7Zm-5-5a1.5,1.5,0,0,0,0,3h5a1.5,1.5,0,0,0,0-3Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M25.5,48h-5a3.5,3.5,0,0,1,0-7h5a3.5,3.5,0,0,1,0,7Zm-5-5a1.5,1.5,0,0,0,0,3h5a1.5,1.5,0,0,0,0-3Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M25.5,53h-5a3.5,3.5,0,0,1,0-7h5a3.5,3.5,0,0,1,0,7Zm-5-5a1.5,1.5,0,0,0,0,3h5a1.5,1.5,0,0,0,0-3Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M45,39H38a4,4,0,0,1,0-8h8a1,1,0,0,1,0,2H38a2,2,0,0,0,0,4h7a1,1,0,0,1,0,2Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M58,37H51a1,1,0,0,1-1-1,3,3,0,0,0-3-3H46a1,1,0,0,1,0-2h1a5.008,5.008,0,0,1,4.9,4H58a1,1,0,0,1,0,2Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M47,55H46a1,1,0,0,1,0-2h1a3,3,0,0,0,3-3,1,1,0,0,1,1-1h7a1,1,0,0,1,0,2H51.9A5.008,5.008,0,0,1,47,55Z"
                ></path>
                <path
                    style={{ fill: '#363636' }}
                    d="M41,26a3.152,3.152,0,0,1-.493-.04A3.084,3.084,0,0,1,38,22.893V16a1,1,0,0,1,2,0v6.893a1.083,1.083,0,0,0,.825,1.092A1,1,0,0,0,42,23V15.83a1,1,0,1,1,2,0V23a3,3,0,0,1-3,3Z"
                ></path>
            </svg>
            <span>{text}</span>
        </button>
    );
}

Button.propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};