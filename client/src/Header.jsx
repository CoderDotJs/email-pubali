import { useAuth } from "./Auth/AuthProvider";
import { Button } from "./components/ui/button";
import { NavLink } from "react-router-dom";

const Header = () => {
  const { user, logOut } = useAuth();
  return (
    <div className="flex justify-between items-center py-3">
      <h1 className="text-lg font-medium">Email App</h1>
      <div className="flex items-center gap-3">
        {user.role === "admin" && (
          <div className="flex items-center gap-3">
            <Button variant="link">
              <NavLink to="/" className={""}>
                Home
              </NavLink>
            </Button>
            <Button variant="link">
              <NavLink to="/add-user" className={""}>
                Add User
              </NavLink>
            </Button>
            <Button variant="link">
              <NavLink to="/stats" className={""}>
                Statistics
              </NavLink>
            </Button>
          </div>
        )}
        <Button className="my-3" variant="destructive" onClick={() => logOut()}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Header;
