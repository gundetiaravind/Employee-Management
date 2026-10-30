
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon, Users } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const links = [
    ["Home", "home"],
    ["About", "about"],
    ["Features", "features"],
    ["Contact", "contact"],
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="nav-container">
        <a href="#home" className="brand" onClick={closeMenu}>
          <span className="brand-icon"><Users size={23} /></span>
          <span>Org<span className="brand-highlight">Connect</span></span>
        </a>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={closeMenu}>
              {label}
            </a>
          ))}
          <div className="mobile-auth">
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="nav-register" onClick={closeMenu}>
              Get Started
            </Link>
          </div>
        </nav>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <Link to="/login" className="nav-login">Login</Link>
          <Link to="/register" className="nav-register desktop-register">
            Get Started
          </Link>

          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
