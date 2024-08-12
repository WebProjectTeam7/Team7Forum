/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
import { useContext, useState } from 'react';
import { AppContext } from '../state/app.context';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth.service';
import './CSS/Register.css';
import { useEffect } from 'react';
import errorGif from '../image/error.gif';
import './CSS/Modal.css';

export default function Login() {
    const [user, setUser] = useState({
        email: '',
        password: '',
    });
    const { setAppState } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [remember, setRemember] = useState(false);
    const [noCredentials, setNoCredentials] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.email) {
            setUser({
                email: storedUser.email,
                password: remember ? storedUser.password : '',
            });
        }
    }, [remember]);

    const updateUser = prop => e => {
        setUser({
            ...user,
            [prop]: e.target.value,
        });
    };

    const toggleRemember = () => {
        setRemember(!remember);
    };

    const login = async (e) => {
        e.preventDefault();
        if (!user.email || !user.password) {
            setNoCredentials(true);
            return;
        }

        try {
            const credentials = await loginUser(user.email, user.password);

            if (remember) {
                localStorage.setItem('user', JSON.stringify({
                    email: user.email,
                    password: user.password,
                }));
            } else {
                localStorage.removeItem('user');
            }
            setAppState({
                user: credentials.user,
                userData: null,
            });
            navigate(location.state?.from.pathname ?? '/');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const closeModal = () => {
        setNoCredentials(false);
        setErrorMessage('');
    };

    return (
        <div>
        <form onSubmit={login}>
            <h1>Login</h1>
            <label htmlFor="email">Email: </label>
            <input value={user.email} onChange={updateUser('email')} type="text" name="email" id="email" /><br /><br />
            <label htmlFor="password">Password: </label>
            <input value={user.password} onChange={updateUser('password')} type="password" name="password" id="password" /><br />
            <div className="checkbox-container" style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="checkbox-remember" checked={remember} onChange={toggleRemember} />
            <label htmlFor="checkbox-remember" style={{ marginLeft: '8px' }}>Remember Me</label>
        </div><br />
            <button type="submit">Login</button>
        </form>

    {noCredentials && (
        <div className="modal-overlay">
        <div className="modal-content">
            <h2>No credentials provided!</h2>
            <p>Please fill in all fields.</p>
            <button onClick={closeModal}>OK</button>
        </div>
        </div>
)}

    {errorMessage && (
        <div className="modal-overlay">
        <div className="modal-content">
            <h2>Error</h2>
            <img src={errorGif} alt="Error" />
            <p>{errorMessage}</p>
            <button onClick={closeModal}>OK</button>
        </div>
        </div>
        )}
        </div>
    );
}
