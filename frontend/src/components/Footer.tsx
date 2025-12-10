import { NavLink } from "react-router-dom";
import Logo from "../assets/awtc-logo.png";

function Footer() {
  const handleNavClick = () => {
    window.scrollTo(0, 0);
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = "/aboutus#contact-section";
  };
  return (
    <footer className="bg-[#fcfcfc] text-gray-800" style={{ boxShadow: '0 -8px 24px rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo, tagline, social icons */}
          <div>
            <img src={Logo} alt="AWTC Logo" className="h-12 w-12 mb-3" />
            <p className="mb-4">Together for a better planet</p>
            <div className="flex space-x-3">
              <a href="#" aria-label="Facebook" className="hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.4c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.2h-1.13c-1.12 0-1.47.69-1.47 1.4v1.7h2.5l-.4 2.9h-2.1v7A10 10 0 0022 12z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M22 5.92c-.63.28-1.3.47-2 .55a3.48 3.48 0 001.53-1.93 6.94 6.94 0 01-2.2.84 3.47 3.47 0 00-5.92 3.16A9.86 9.86 0 013 4.79a3.47 3.47 0 001.07 4.63c-.52-.02-1.02-.16-1.45-.4v.04a3.47 3.47 0 002.78 3.4c-.43.12-.88.12-1.33.05.38 1.18 1.48 2.04 2.78 2.06A6.96 6.96 0 012 19.54a9.84 9.84 0 005.33 1.56c6.4 0 9.9-5.3 9.9-9.9v-.45A7.07 7.07 0 0022 5.92z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className=" hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.5-2.7a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Columns 2 & 3 grouped: Company + Explore */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="footer-title mb-3">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink to="/home" className="body-small hover:underline" onClick={handleNavClick}>Home</NavLink>
                </li>
                <li>
                  <NavLink to="/volunteering" className="body-small hover:underline" onClick={handleNavClick}>Volunteering</NavLink>
                </li>
                <li>
                  <NavLink to="/moreinfo" className="body-small hover:underline" onClick={handleNavClick}>Info</NavLink>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer-title mb-3">Company</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink to="/aboutus" className="body-small hover:underline" onClick={handleNavClick}>About Us</NavLink>
                </li>
                <li>
                  <a href="/aboutus#contact-section" className="body-small hover:underline" onClick={handleContactClick}>Contact</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="footer-title mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/terms" className="body-small hover:underline" onClick={handleNavClick}>Terms &amp; Conditions</NavLink>
              </li>
              <li>
                <NavLink to="/privacy" className="body-small hover:underline" onClick={handleNavClick}>Privacy Policy</NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="tiny-extralight text-gray-500 text-center mt-8">© {new Date().getFullYear()} AWTC. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default Footer;
