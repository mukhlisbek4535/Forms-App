import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import API from "../api/axios.js";

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  register: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: true,
  });
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // for checking login state from localStorage
  useEffect(() => {
    const authVerify = async () => {
      try {
        const { data } = await API.get(
          "/verify",
          // "https://forms-app-vff5.onrender.com/verify",
          {
            headers: { Authorization: `Bearer ${authState.token}` },
          }
        );

        setAuthState({ user: data.user, token: data.token, loading: false });
      } catch (error) {
        // logout();
        setAuthState({ user: null, token: null, loading: false });
      }
    };

    if (authState.token) authVerify();
    // const storedLoginState = localStorage.getItem("isLoggedIn");
    // if (storedLoginState === "true") {
    //   setIsLoggedIn(true);
    // }
  }, []);

  // Login function --->>>>
  const login = async (credentials) => {
    try {
      const { data } = await API.post(
        "/login",
        // "https://forms-app-vff5.onrender.com/login",
        credentials
      );
      localStorage.setItem("token", data.token);
      setAuthState({ user: data.user, token: data.token });
      return true;
    } catch (error) {
      console.error("login failed!: ", error.response.data.message);
      throw error;
    }
    // setIsLoggedIn(true);
    // localStorage.setItem("isLoggedIn", "true");
  };

  // Register function ------>>>>>>
  const register = async (newUserData) => {
    try {
      const { data } = await API.post(
        "/register",
        // "https://forms-app-vff5.onrender.com/register",
        newUserData
      );
      localStorage.setItem("token", data.user.token);
      setAuthState({ user: data.user, token: data.user.token });
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Logout function ------>>>>>>>
  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ user: null, token: null });
    API.post(
      "/logout"
      // "https://forms-app-vff5.onrender.com/logout"
    );

    return true;
    // setIsLoggedIn(false);
    // localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: !!authState.token,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
