import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

const PrivateRoute = () => {
  const { user, isUserLoading } = useAuth();
  console.log(user);
  if (isUserLoading && !user) {
    return "Loading";
  }
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
};

export default PrivateRoute;
