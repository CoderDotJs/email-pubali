import { useAuth } from "./Auth/AuthProvider";
import { Button } from "./components/ui/button";
import { NavLink, useLocation } from "react-router-dom";

const Header = () => {
  const { user, logOut } = useAuth();
  const location = useLocation();
  console.log(location);
  return (
    <div className="flex justify-between items-center py-3">
      <h1 className="text-lg font-medium">Email App</h1>
      <div className="flex items-center gap-3">
        {user.role === "admin" && (
          <div className="flex items-center gap-3">
            <Button variant="link">
              <NavLink
                to="/"
                className={location.pathname === "/" ? "underline" : ""}
              >
                Home
              </NavLink>
            </Button>
            <Button variant="link">
              <NavLink
                to="/add-user"
                className={location.pathname === "/add-user" ? "underline" : ""}
              >
                Add User
              </NavLink>
            </Button>
          </div>
        )}
        <Button variant="link">
          <NavLink
            to="/upload"
            className={location.pathname === "/upload" ? "underline" : ""}
          >
            Upload
          </NavLink>
        </Button>
        <Button variant="link">
          <NavLink
            to="/stats"
            className={location.pathname === "/stats" ? "underline" : ""}
          >
            Statistics
          </NavLink>
        </Button>
        <Button className="my-3" variant="destructive" onClick={() => logOut()}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Header;
