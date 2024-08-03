import { useContext, useState } from 'react';
import { registerUser } from '../services/auth.service';
import { AppContext } from '../state/app.context';
import { useNavigate } from 'react-router-dom';
import { createUserHandle, getUserByHandle } from '../services/users.service';
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX, USER_REGEX } from '../common/regex';
import PasswordStrengthIndicator from '../components/PasswordStrength';
import RoleEnum from '../common/role.enum';
import InfoButton from '../components/InfoButton';
import { FaEye } from 'react-icons/fa';

export default function Register() {
    const { setAppState } = useContext(AppContext);
    const [user, setUser] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: RoleEnum.USER,
    });

    const [hidePassword, setHidePassword] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setHidePassword(!hidePassword);
    };

    const navigate = useNavigate();

    const updateUser = prop => e => {
        setUser({
            ...user,
            [prop]: e.target.value,
        });
    };

    const register = async (e) => {
        e.preventDefault();

        setLoading(true);
        setAlertMessage('');

        const alertArr = [];

        if (!USER_REGEX.test(user.username)) {
            alertArr.push('Invalid Username!');
        }

        if (!EMAIL_REGEX.test(user.email)) {
            alertArr.push('Invalid Email address!');
        }

        if (!NAME_REGEX.test(user.firstName)) {
            alertArr.push('Invalid First name!');
        }

        if (!NAME_REGEX.test(user.lastName)) {
            alertArr.push('Invalid Last name!');
        }

        if (!PASSWORD_REGEX.test(user.password)) {
            alertArr.push('Invalid Password!');
        }

        if (user.password !== user.confirmPassword) {
            alertArr.push('Passwords don\'t match!');
        }

        if (alertArr.length > 0) {
            setAlertMessage(alertArr.join('\n'));
            setLoading(false);
            return alert(alertMessage);
        }

        try {
            const userFromDB = await getUserByHandle(user.username);
            if (userFromDB) {
                return alert(`User {${user.username}} already exists!`);
            }
            const credential = await registerUser(user.email, user.password);
            await createUserHandle(user.username, credential.user.uid, user.email, user.firstName, user.lastName, user.role);
            setAppState({ user: credential.user, userData: null });
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={register}>
                <h1>Register</h1>

                {/* USERNAME */}
                <label htmlFor="username">Username: </label>
                <InfoButton text=" Username must be:
                                        between 4 to 32 characters,
                                        begin with a letter,
                                        consist of letters, numbers, underscores, or hyphens."/>
                <input
                    value={user.username}
                    onChange={updateUser('username')}
                    type="text"
                    name="username"
                    id="username"
                />

                <br /><br />

                {/* EMAIL */}
                <label htmlFor="email">Email: </label>
                <InfoButton text=" Must be a valid email address." />
                <input
                    value={user.email}
                    onChange={updateUser('email')}
                    type="text"
                    name="email"
                    id="email"
                />
                <br /><br />

                {/* FIRST NAME */}
                <label htmlFor="firstName">First Name: </label>
                <InfoButton text="First name must be:
                                        between 4 to 32 characters,"/>
                <input
                    value={user.firstName}
                    onChange={updateUser('firstName')}
                    type="text"
                    name="firstName"
                    id="firstName"
                />
                <br /><br />

                {/* LAST NAME */}
                <label htmlFor="lastName">Last Name: </label>
                <InfoButton text="Last name must be:
                                        between 4 to 32 characters,"/>
                <input
                    value={user.lastName}
                    onChange={updateUser('lastName')}
                    type="text"
                    name="lastName"
                    id="lastName"
                />

                <br /><br />

                {/* PASSWORD */}
                <label htmlFor="password">Password: </label>
                <InfoButton text="Password must be between 5 to 30 characters.
                                    Include uppercase and lowercase letters, numbers, and special characters
                                    to create a strong password."/>
                <input
                    value={user.password}
                    onChange={updateUser('password')}
                    type={hidePassword ? 'password' : 'text'}
                    name="password"
                    id="password"
                />
                <a onClick={togglePasswordVisibility}>
                    <FaEye style={{ color: !hidePassword ? '#FF0054' : '#c3c3c3' }} />
                </a>
                <PasswordStrengthIndicator password={user.password} />
                <br />

                {/* CONFIRM PASSWORD */}
                <label htmlFor="confirmPassword">Confirm Password: </label>
                <input
                    value={user.confirmPassword}
                    onChange={updateUser('confirmPassword')}
                    type={hidePassword ? 'password' : 'text'}
                    name="confirmPassword"
                    id="confirmPassword"
                /><br />

                {/* SUBMIT */}
                <button>Register</button>
            </form>
        </>
    );
}
