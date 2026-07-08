/**
 * Partials Script - Handles shared Header and Footer
 */

const createHeader = () => {
    const headerContent = `
    <nav class="navbar">
        <div class="container nav-wrapper">
            <a href="index.html" class="logo serif">Diocese of Igbomina West</a>
            <button class="mobile-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-links">
                <li><a href="index.html" data-page="index.html">Home</a></li>
                <li><a href="about.html" data-page="about.html">About</a></li>
                <li><a href="news.html" data-page="news.html">News</a></li>
                <li><a href="events.html" data-page="events.html">Events</a></li>
                <li><a href="sermons.html" data-page="sermons.html">Sermons</a></li>
                <li><a href="gallery.html" data-page="gallery.html">Gallery</a></li>
                <li><a href="contact.html" data-page="contact.html">Contact</a></li>
            </ul>
        </div>
    </nav>
    `;

    const headerElem = document.getElementById('header-placeholder');
    if (headerElem) {
        headerElem.innerHTML = headerContent;
        highlightActiveLink();
        setupMobileMenu();
    }
};

const createFooter = () => {
    const footerContent = `
    <footer class="footer">
        <div class="container">
            <div class="grid footer-grid">
                <div class="footer-info">
                    <h3 class="serif">Diocese of Igbomina West</h3>
                    <p>Building a community of faith, hope, and love.</p>
                </div>
                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact</a></li>
                        <li><a href="admin.html">Admin Login</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h4>Contact Us</h4>
                    <p>123 Cathedral Square<br>Cityville, ST 12345</p>
                    <p>Email: info@stjudediocese.org</p>
                    <p>Phone: (555) 012-3456</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Diocese of Igbomina West. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
    `;

    const footerElem = document.getElementById('footer-placeholder');
    if (footerElem) {
        footerElem.innerHTML = footerContent;
    }
};

const highlightActiveLink = () => {
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
        }
    });
};

const setupMobileMenu = () => {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-links');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            toggle.classList.toggle('toggle-active');
        });
    }
};

// Add necessary CSS for the navbar to style.css or keep it here
const injectNavbarStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .navbar {
            background: var(--white);
            box-shadow: var(--shadow);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .nav-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 1.5rem;
            color: var(--primary-color);
        }
        .nav-links {
            display: flex;
            gap: 1.5rem;
        }
        .nav-links a {
            font-weight: 500;
            color: var(--text-secondary);
            padding: 0.5rem 0;
            border-bottom: 2px solid transparent;
        }
        .nav-links a:hover, .nav-links a.active {
            color: var(--primary-color);
            border-bottom: 2px solid var(--secondary-color);
        }
        .mobile-toggle {
            display: none;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
        }
        .mobile-toggle span {
            width: 25px;
            height: 3px;
            background: var(--primary-color);
            transition: var(--transition);
        }
        .footer {
            background: var(--primary-color);
            color: var(--white);
            padding: var(--spacing-lg) 0 var(--spacing-sm);
            margin-top: var(--spacing-lg);
        }
        .footer h3, .footer h4 { color: var(--secondary-color); margin-bottom: 1rem; }
        .footer-grid { margin-bottom: var(--spacing-md); }
        .footer-bottom { 
            text-align: center; 
            padding-top: var(--spacing-md); 
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 0.9rem;
            color: var(--accent-color);
        }
        
        @media (max-width: 768px) {
            .mobile-toggle { display: flex; }
            .nav-links {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: var(--white);
                flex-direction: column;
                padding: 2rem;
                gap: 1rem;
                text-align: center;
                transform: translateY(-150%);
                transition: transform 0.3s ease-in-out;
                box-shadow: var(--shadow);
            }
            .nav-links.nav-active { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    injectNavbarStyles();
    createHeader();
    createFooter();
});
