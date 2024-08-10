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
import AdminPage from './views/AdminPage';
import UserProfile from './views/UserProfile';
import Forum from './views/Forum';
import Category from './views/Category';
import Thread from './views/Thread';
import Beerpedia from './views/Beerpedia';
import Authenticated from './hoc/Authenticated';
import SearchResultPage from './views/SearchResultPage';
import RedirectIfAuthenticated from './hoc/RedirectIfAuthenticated';
import UserRoleEnum from './common/role.enum';


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
                console.error(e.message);
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
                    <Route path="/search-results" element={<SearchResultPage />} />
                    <Route path="/register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
                    <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
                    <Route path="/my-profile" element={<Authenticated><MyProfile /></Authenticated>} />
                    <Route path="/user-profile/:username" element={<Authenticated><UserProfile /></Authenticated>} />
                    <Route path="/admin-page" element={<Authenticated requiredRole={UserRoleEnum.ADMIN}><AdminPage /></Authenticated>} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/category/:categoryId" element={<Category />} />
                    <Route path="/forum/thread/:threadId" element={<Thread />} />
                    <Route path="/beerpedia" element={<Beerpedia />}></Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <footer>&copy;Team7Forum</footer>
            </AppContext.Provider>
        </BrowserRouter >
    );
}
