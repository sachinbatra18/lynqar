// Global function for mobile menu links
function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.className = 'fixed top-0 left-full w-full h-screen bg-black/95 backdrop-blur transition-all duration-300 md:hidden';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      // Toggle mobile menu
      if (mobileMenu.classList.contains('left-full')) {
        mobileMenu.classList.remove('left-full');
        mobileMenu.classList.add('left-0');
      } else {
        mobileMenu.classList.add('left-full');
        mobileMenu.classList.remove('left-0');
      }
    });
  }

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!mobileMenuBtn?.contains(e.target) && !mobileMenu?.contains(e.target)) {
      mobileMenu?.classList.add('left-full');
      mobileMenu?.classList.remove('left-0');
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      mobileMenu?.classList.add('left-full');
      mobileMenu?.classList.remove('left-0');
    }
  });
});
