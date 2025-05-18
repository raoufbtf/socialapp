import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
const localUser = JSON.parse(localStorage.getItem("user"));

// Récupère l'utilisateur depuis localStorage (sans .data)


// État initial
const INITIAL_STATE = {
  user: localUser || null,
  isAuthenticated: Boolean(localUser), 
  isFetching: false,
  error: false,
};


export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  
  useEffect(()=>{
    localStorage.setItem("user", JSON.stringify(state.user))
  },[state.user])
  
  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
