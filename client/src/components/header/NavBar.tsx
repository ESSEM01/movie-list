import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../../services/api";
import "../../css/Navbar.css";

function NavBar() {
    const navigate = useNavigate();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await isAuthenticated();
            setAuthenticated(isAuth);
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Movie App</Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                {authenticated ? (
                    <>
                        <Link to="/favorites" className="nav-link">Favorites</Link>
                        <button onClick={handleLogout} className="nav-link logout-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="nav-link">Login</Link>
                )}
            </div>
        </nav>
    )
}

export default NavBar