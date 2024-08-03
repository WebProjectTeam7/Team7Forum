import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppContext } from './state/app.context';
import Login from './views/Login';
import Register from './views/Register';
import { auth } from './config/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserData } from './services/users.service';
import Header from './components/Header';
import NotFound from './views/NotFound';
import Home from './views/Home';
import MyProfile from './views/MyProfile';
import CreatePost from './views/CreatePost';
import AllPosts from './views/AllPost';
import AdminPage from './views/AdminPage';
import UserProfile from './views/UserProfile';
import Survey from './views/Survey';
import AddSurvey from './views/AddSurvey';
import SurveyList from './views/SurveyList';
import SinglePost from './views/SinglePost';

export default function App() {
    const [appState, setAppState] = useState({
        user: null,
        userData: null,
    });
    const [user, loading, error] = useAuthState(auth);
    const [searchQuery, setSearchQuery] = useState('');

    if (appState.user !== user) {
        setAppState({ ...appState, user });
    }

    useEffect(() => {
        if (!user) return;
        getUserData(appState.user.uid)
            .then((data) => {
                const userData = data[Object.keys(data)[0]];
                setAppState({ ...appState, userData });
            })
            .catch((e) => {
                alert(e.message);
            });
    }, [user]);

    return (
        <BrowserRouter>
            <AppContext.Provider
                value={{ ...appState, setAppState, searchQuery, setSearchQuery }}
            >
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/my-profile" element={<MyProfile />}></Route>
                    <Route path="/user-profile/:id" element={<UserProfile />}></Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/post-create" element={<CreatePost />} />
                    <Route path="/single-post/:id" element={<SinglePost />}></Route>
                    <Route path="/all-posts" element={<AllPosts />}></Route>
                    <Route path="/surveys" element={<SurveyList />} />
                    <Route path="/survey/:id" element={<Survey />} />
                    <Route path="/add-survey" element={<AddSurvey />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin-page" element={<AdminPage />}></Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <footer>&copy;Team7Forum</footer>
            </AppContext.Provider>
        </BrowserRouter>
    );
}
