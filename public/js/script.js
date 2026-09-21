document.addEventListener('DOMContentLoaded', () => {
  // Mobile Hamburger Menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // Active Link Highlighting based on current page
  const currentLocation = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-links a');

  navItems.forEach(link => {
    // If the link href matches the end of the location path
    if (link.getAttribute('href') !== '#' && currentLocation.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  // Scroll Animations (Intersection Observer)
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Optional: only animate once
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));

  // Navbar Scroll Effect (shrink/shadow adjustment on scroll)
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      header.style.padding = '0';
    } else {
      header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
    }
  });
});
