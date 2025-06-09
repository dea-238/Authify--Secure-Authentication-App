import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { AppConstants } from "../util/constants.js";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // Global axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "https://authify-secure-authentication-app-production.up.railway.app/api/v1.0";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fetch logged-in user (if cookie is present)
  const getUserData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile`, { withCredentials: true });
      setUserData(res.data);
      setIsLoggedIn(true);
    } catch {
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => { getUserData(); }, []);

  return (
    <AppContext.Provider
      value={{ isLoggedIn, userData, setUserData, setIsLoggedIn, getUserData }}
    >
      {children}
    </AppContext.Provider>
  );
};
