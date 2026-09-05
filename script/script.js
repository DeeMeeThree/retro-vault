// Mobile Menu Toggle (shared across pages with a top nav + hamburger)
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        let closeTimer = null;

        const openMenu = () => {
            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
            requestAnimationFrame(() => {
                mobileMenu.classList.add('menu-open');
            });
            mobileMenuBtn.classList.add('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('menu-open');
            mobileMenuBtn.classList.remove('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            closeTimer = setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
                closeTimer = null;
            }, 300);
        };

        mobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu.classList.contains('menu-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target) && mobileMenu.classList.contains('menu-open')) {
                closeMenu();
            }
        });
    }
}

initMobileMenu();
