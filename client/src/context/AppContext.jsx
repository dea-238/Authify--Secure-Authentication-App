import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { AppConstants } from "../util/constants.js";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // Global axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = AppConstants.API;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData]   = useState(null);

  // Fetch logged-in user (if cookie is present)
  const getUserData = async () => {
    try {
      const res = await axios.get("/profile");
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
