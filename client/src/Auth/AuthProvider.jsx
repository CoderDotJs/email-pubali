/* eslint-disable react/prop-types */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    mutate: loginHandler,
    isSuccess,
    isError,
    isPending,
    error,
    reset,
    data,
  } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/login",
        data
      );
      return res.data.user;
    },
    onSuccess: (data) => {
      navigate("/");
      localStorage.setItem("user", JSON.stringify(data));
      window.location.reload();
    },
    onMutate: () => {
      setIsUserLoading(true);
    },
    onSettled: () => {
      setIsUserLoading(false);
    },
  });

  const logOut = () => {
    reset();
    navigate("/login");
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    setIsUserLoading(true);
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      queryClient.setQueryData(["user"], foundUser);
      setUser(foundUser);
    }
    setIsUserLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginHandler,
        logOut,
        isLoading: isUserLoading || isPending,
        isError,
        isSuccess,
        error,
        setUser,
        data,
      }}
    >
      {isUserLoading || isPending ? (
        <div className="flex items-center justify-center">Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
