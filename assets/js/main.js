/**
 * Agarwal Best Packers and Movers - Global JavaScript
 * Dependencies: config/site.js (optional, enhances dynamic injection)
 * Vanilla JS, no external libraries.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. INJECT SITE CONFIG (Single Source of Truth)
  if (typeof window.SITE_CONFIG !== 'undefined') {
    const cfg = window.SITE_CONFIG;

    // Inject Phone
    document.querySelectorAll('[data-site-phone]').forEach(el => {
      el.textContent = cfg.phoneDisplay;
      if (el.tagName === 'A') el.href = `tel:${cfg.phoneTel}`;
    });

    // Inject Phone Href Only (leaves text/label intact)
    document.querySelectorAll('[data-site-phone-href]').forEach(el => {
      if (el.tagName === 'A') el.href = `tel:${cfg.phoneTel}`;
    });

    // Inject SMS Href
    document.querySelectorAll('[data-site-sms]').forEach(el => {
      if (el.tagName === 'A') el.href = `sms:${cfg.phoneTel}`;
    });

    // Inject WhatsApp
    document.querySelectorAll('[data-site-whatsapp]').forEach(el => {
      if (el.tagName === 'A') el.href = cfg.whatsappUrl;
    });

    // Inject Email
    document.querySelectorAll('[data-site-email]').forEach(el => {
      el.textContent = cfg.email;
      if (el.tagName === 'A') el.href = `mailto:${cfg.email}`;
    });

    // Inject Email Href Only (leaves text/label intact)
    document.querySelectorAll('[data-site-email-href]').forEach(el => {
      if (el.tagName === 'A') el.href = `mailto:${cfg.email}`;
    });

    // Inject Full Address
    document.querySelectorAll('[data-site-address]').forEach(el => {
      el.textContent = cfg.address.full;
    });

    // Inject Brand Name
    document.querySelectorAll('[data-site-brand]').forEach(el => {
      el.textContent = cfg.brandName;
    });
  }

  // 2. STICKY HEADER SCROLL EFFECT
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('header-scrolled');
      } else {
        siteHeader.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 3. MOBILE DRAWER NAVIGATION & FOCUS TRAPPING
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.querySelector('.mobile-overlay');
  const drawerCloseBtn = document.querySelector('.drawer-close');

  if (menuToggle && drawer && drawerOverlay) {
    let previousActiveElement = null;

    const openDrawer = () => {
      previousActiveElement = document.activeElement;
      drawer.classList.add('active');
      drawerOverlay.classList.add('active');
      document.body.classList.add('scroll-locked');
      menuToggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');

      // Focus first focusable element inside drawer
      const focusable = drawer.querySelectorAll('a, button, input');
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    };

    const closeDrawer = () => {
      drawer.classList.remove('active');
      drawerOverlay.classList.remove('active');
      document.body.classList.remove('scroll-locked');
      menuToggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');

      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };

    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', closeDrawer);
    }

    drawerOverlay.addEventListener('click', closeDrawer);

    // Close on drawer link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Keyboard support: Escape key & focus trapping
    document.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = drawer.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  // 4. ACCESSIBLE KEYBOARD DROPDOWN MENU (SERVICES)
  // Hover is handled by CSS (.nav-dropdown:hover > .dropdown-menu).
  // JS adds keyboard accessibility only — no click needed.
  const navDropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (dropdownToggle && dropdownMenu && navDropdown) {
    const openDropdown = () => {
      dropdownMenu.classList.add('show');
      dropdownToggle.setAttribute('aria-expanded', 'true');
    };
    const closeDropdown = () => {
      dropdownMenu.classList.remove('show');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    };

    // Sync hover state with aria-expanded for screen readers
    navDropdown.addEventListener('mouseenter', openDropdown);
    navDropdown.addEventListener('mouseleave', closeDropdown);

    // Also keep click toggle for keyboard/touch users
    dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.contains('show');
      isOpen ? closeDropdown() : openDropdown();
    });

    // Keyboard navigation within the dropdown
    dropdownToggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDropdown();
        const firstLink = dropdownMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    const dropdownLinks = dropdownMenu.querySelectorAll('a');
    dropdownLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextLink = dropdownLinks[index + 1] || dropdownLinks[0];
          nextLink.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevLink = dropdownLinks[index - 1] || dropdownLinks[dropdownLinks.length - 1];
          prevLink.focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown();
          dropdownToggle.focus();
        }
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navDropdown.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  // 5. ACCESSIBLE ACCORDIONS (FAQ)
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      // Optional: close other accordions in the same container for clean accordion feel
      const parentAccordion = header.closest('.accordion');
      if (parentAccordion) {
        parentAccordion.querySelectorAll('.accordion-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            const otherHeader = otherItem.querySelector('.accordion-header');
            if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          }
        });
      }

      header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
      item.classList.toggle('open', !isExpanded);
    });
  });

  // 6. MOBILE BOTTOM BAR MAIL BUTTON -> TAKE USER TO ENQUIRE FORM
  document.querySelectorAll('.email-bottom-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const form = document.querySelector('#quick-enquiry-form, #contact-form, #multistep-quote-form, .hero-form-card, form');
      if (form) {
        e.preventDefault();
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const firstInput = form.querySelector('input:not([type=hidden]), textarea');
        if (firstInput) {
          setTimeout(() => {
            firstInput.focus();
          }, 350);
        }
      }
      // If no form on this page, natural navigation to href="/get-quote/" occurs!
    });
  });
});
