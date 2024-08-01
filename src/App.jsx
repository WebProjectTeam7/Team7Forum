import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppContext } from "./state/app.context";
import Login from "./views/Login";
import Register from "./views/Register";
import { app, auth } from "./config/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { getUserData } from "./services/users.service";
import Header from "./components/Header";
import NotFound from "./views/NotFound";
import MyProfile from "./views/MyProfile";

function App() {
  const [appState, setAppState] = useState({
    user: null,
    userData: null,
  });
  const [user, loading, error] = useAuthState(auth);

  if (appState.user !== user) {
    setAppState({ ...appState, user });
  }

  useEffect(() => {
    if (!user) return;
    getUserData(appState.user.uid)
      .then((data) => {
        console.log(data);
        const userData = data[Object.keys(data)[0]];
        setAppState({ ...appState, userData });
      })
      .catch((e) => { alert(e.message) });
  }, [user]);

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ ...appState, setAppState }}>
        <Header />
        <Routes>
          <Route path="/my-profile" element={<MyProfile />}></Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer>&copy;Team7Forum</footer>
      </AppContext.Provider>
    </BrowserRouter>
  );
}

export default App;
