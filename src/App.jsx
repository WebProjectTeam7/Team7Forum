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
import EditSurvey from './components/EditSurvey';
import NotFound from './views/NotFound';
import Home from './views/Home';
import MyProfile from './views/MyProfile';
import AdminPage from './views/AdminPage';
import UserProfile from './views/UserProfile';
import Survey from './views/Survey';
import AddSurvey from './views/AddSurvey';
import SurveyList from './views/SurveyList';
import Forum from './views/Forum';
import Category from './views/Category';
import Thread from './views/Thread';

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
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/my-profile" element={<MyProfile />} />
                    <Route path="/user-profile/:id" element={<UserProfile />} />
                    <Route path="/add-survey" element={<AddSurvey />} />
                    <Route path="/survey/:id" element={<Survey />} />
                    <Route path="/surveys" element={<SurveyList />} />
                    <Route path="/edit-survey/:id" element={<EditSurvey />} />
                    <Route path="/admin-page" element={<AdminPage />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/category/:categoryId" element={<Category />} />
                    <Route path="/forum/thread/:threadId" element={<Thread />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <footer>&copy;Team7Forum</footer>
            </AppContext.Provider>
        </BrowserRouter>
    );
}
