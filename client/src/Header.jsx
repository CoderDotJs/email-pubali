import { useAuth } from "./Auth/AuthProvider";
import { Button } from "./components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { logo } from "./logo";

const Header = () => {
  const { user, logOut } = useAuth();
  const location = useLocation();
  return (
    <div className="w-full shadow-md">
      <div className="flex justify-between items-center py-3 px-6 container">
        <img className="h-10 w-auto" src={logo} alt="Your Company" />
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
                  className={
                    location.pathname === "/add-user" ? "underline" : ""
                  }
                >
                  Add User
                </NavLink>
              </Button>
            </div>
          )}
          <Button variant="link">
            <NavLink
              to="/test"
              className={location.pathname === "/test" ? "underline" : ""}
            >
              Test
            </NavLink>
          </Button>
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
          <Button
            className="my-3"
            variant="destructive"
            onClick={() => logOut()}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
