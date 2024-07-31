import { useContext, useEffect, useState } from 'react'
import './App.css'
import Home from './views/Home'
import AllTweets from './views/AllTweets';
import CreateTweet from './views/CreateTweet';
import Header from './components/Header';
import Effects from './views/Effects';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NotFound from './views/NotFound';
import SingleTweet from './views/SingleTweet';
import { AppContext } from './state/app.context';
import Login from './views/Login';
import Authenticated from './hoc/Authenticated';
import Register from './views/Register';
import { auth } from './config/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserData } from './services/users.service';

function App() {
  const [appState, setAppState] = useState({
    user: null,
    userData: null,
  });
  const [user, loading, error] = useAuthState(auth);

  if (appState.user !== user) {
    setAppState({...appState, user });
  }

  useEffect(() => {
    if (!user) return;

    getUserData(appState.user.uid)
      .then(data => {
        const userData = data[Object.keys(data)[0]];
        setAppState({...appState, userData});
      });
  }, [user]);

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ ...appState, setAppState }}>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tweets' element={<Authenticated><AllTweets /></Authenticated>} />
          <Route path='/tweets/:id' element={<Authenticated><SingleTweet /></Authenticated>} />
          <Route path='/tweets-create' element={<Authenticated><CreateTweet /></Authenticated>} />
          <Route path='/effects' element={<Authenticated><Effects /></Authenticated>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        <footer>&copy;2024</footer>
      </AppContext.Provider>
    </BrowserRouter>
  )
}

export default App
