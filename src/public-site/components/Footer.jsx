
import { Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-container footer-content">
        <a href="#home" className="brand">
          <span className="brand-icon"><Users size={21} /></span>
          <span>Org<span className="brand-highlight">Connect</span></span>
        </a>

        <p>Organize people. Simplify work. Grow together.</p>

        <span>© {new Date().getFullYear()} OrgConnect. All rights reserved.</span>
      </div>
    </footer>
  );
}
