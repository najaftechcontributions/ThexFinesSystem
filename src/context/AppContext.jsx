import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  employees: [],
  violationTypes: [],
  fines: [],
  adminSettings: {},
  filters: {
    employee: "",
    sortBy: "date-desc",
    minAmount: "",
    maxAmount: "",
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_AUTH":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    case "SET_EMPLOYEES":
      return { ...state, employees: action.payload };

    case "ADD_EMPLOYEE":
      return { ...state, employees: [...state.employees, action.payload] };

    case "UPDATE_EMPLOYEE":
      return {
        ...state,
        employees: state.employees.map((emp) =>
          emp.id === action.payload.id ? action.payload : emp,
        ),
      };

    case "DELETE_EMPLOYEE":
      return {
        ...state,
        employees: state.employees.filter((emp) => emp.id !== action.payload),
      };

    case "SET_VIOLATION_TYPES":
      return { ...state, violationTypes: action.payload };

    case "ADD_VIOLATION_TYPE":
      return {
        ...state,
        violationTypes: [...state.violationTypes, action.payload],
      };

    case "UPDATE_VIOLATION_TYPE":
      return {
        ...state,
        violationTypes: state.violationTypes.map((vt) =>
          vt.id === action.payload.id ? action.payload : vt,
        ),
      };

    case "DELETE_VIOLATION_TYPE":
      return {
        ...state,
        violationTypes: state.violationTypes.filter(
          (vt) => vt.id !== action.payload,
        ),
      };

    case "SET_FINES":
      return { ...state, fines: action.payload };

    case "ADD_FINE":
      return { ...state, fines: [...state.fines, action.payload] };

    case "UPDATE_FINE":
      return {
        ...state,
        fines: state.fines.map((fine) =>
          fine.id === action.payload.id ? action.payload : fine,
        ),
      };

    case "DELETE_FINE":
      return {
        ...state,
        fines: state.fines.filter((fine) => fine.id !== action.payload),
      };

    case "SET_ADMIN_SETTINGS":
      return { ...state, adminSettings: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authResult = await authAPI.checkAuth();
      dispatch({
        type: "SET_AUTH",
        payload: {
          user: authResult.user,
          isAuthenticated: authResult.isAuthenticated,
        },
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      dispatch({
        type: "SET_AUTH",
        payload: {
          user: null,
          isAuthenticated: false,
        },
      });
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authAPI.login(credentials);
      dispatch({
        type: "SET_AUTH",
        payload: {
          user: result.user,
          isAuthenticated: true,
        },
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      dispatch({ type: "LOGOUT" });
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false };
    }
  };

  const value = {
    ...state,
    dispatch,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
