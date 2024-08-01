import { useContext, useState } from "react"
import { registerUser } from "../services/auth.service";
import { AppContext } from "../state/app.context";
import { useNavigate } from "react-router-dom";
import { createUserHandle, getUserByHandle } from "../services/users.service";
import { EMAIL_REGEX, PASSWORD_REGEX, USER_REGEX } from "../common/constants";

export default function Register() {
    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });

    const [hidePassword, setHidePassword] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');

    const togglePasswordVisibility = () => {
        setHidePassword(!hidePassword);
    }

    const { setAppState } = useContext(AppContext);
    const navigate = useNavigate();

    const updateUser = prop => e => {
        setUser({
            ...user,
            [prop]: e.target.value,
        })
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

        if (!PASSWORD_REGEX.test(user.password)) {
            alertArr.push('Invalid Password!');
        }

        if (user.password !== user.confirmPassword) {
            alertArr.push('Passwords don\'t  match!');
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
            await createUserHandle(user.username, credential.user.uid, user.email, user.role);
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
            <form onSubmit={register} >
                <h1>Register</h1>

                {/*USERNAME*/}
                <label htmlFor="username">Username: </label>
                <input
                    value={user.username}
                    onChange={updateUser('username')}
                    type="text"
                    name="username"
                    id="username" />
                <br /><br />

                {/*EMAIL*/}
                <label htmlFor="email">Email: </label>
                <input
                    value={user.email}
                    onChange={updateUser('email')}
                    type="text"
                    name="email"
                    id="email" />
                <br /><br />

                {/*PASSWORD*/}
                <label htmlFor="password">Password: </label>
                <input
                    value={user.password}
                    onChange={updateUser('password')}
                    type={hidePassword ? "password" : "text"}
                    name="password"
                    id="password" />
                <a onClick={togglePasswordVisibility}>{hidePassword ? 'Show Passwords' : 'Hide Passwords'}</a>
                <br />

                {/*CONFIRM PASSWORD*/}
                <label htmlFor="confirmPassword">Confirm Password: </label>
                <input
                    value={user.confirmPassword}
                    onChange={updateUser('confirmPassword')}
                    type={hidePassword ? "password" : "text"}
                    name="confirmPassword"
                    id="confirmPassword" />
                <br />

                {/*SUBMIT*/}
                <button>Register</button>
            </form>
        </>
    )
}