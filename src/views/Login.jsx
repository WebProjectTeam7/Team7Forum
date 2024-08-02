import { useContext, useState } from "react"
import { AppContext } from "../state/app.context";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth.service";


export default function Login() {
    const [user, setUser] = useState({
        email: '',
        password: '',
    });
    const { setAppState } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const updateUser = prop => e => {
        setUser({
            ...user,
            [prop]: e.target.value,
        })
    };


    const login = async () => {
        if (!user.email || !user.password) {
            return alert('No credentials provided!');
        }

        try {
            const credentials = await loginUser(user.email, user.password);
            setAppState({
                user: credentials.user,
                userData: null,
            });
            navigate(location.state?.from.pathname ?? '/');
        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <label htmlFor="email">Email: </label>
            <input value={user.email} onChange={updateUser('email')} type="text" name="email" id="email" /><br /><br />
            <label htmlFor="password">Password: </label>
            <input value={user.password} onChange={updateUser('password')} type="password" name="password" id="password" /><br />
            <button onClick={login}>Login</button>
        </div>
    )
}