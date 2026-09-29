document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Header theme + mobile navigation are centralized in
    // public/assets/js/responsive-menu-fix.js. Keeping those handlers in one
    // place prevents duplicate click listeners and double toggles.

    // --- Profile Dropdown ---
    const profileToggleBtn = document.getElementById('profileToggleBtn') || document.querySelector('.profile-toggle');
    const profileMenu = document.getElementById('profileMenu') || document.querySelector('.profile-menu');

    if (profileToggleBtn && profileMenu) {
        profileToggleBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            profileMenu.classList.toggle('active');
            profileToggleBtn.classList.toggle('active');
            profileToggleBtn.setAttribute('aria-expanded', profileMenu.classList.contains('active') ? 'true' : 'false');
        });

        document.addEventListener('click', function (event) {
            if (profileMenu.classList.contains('active') &&
                !profileMenu.contains(event.target) &&
                !profileToggleBtn.contains(event.target)) {
                profileMenu.classList.remove('active');
                profileToggleBtn.classList.remove('active');
                profileToggleBtn.setAttribute('aria-expanded', 'false');
            }
        });

        profileMenu.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }

    // --- Smooth Scroll for Internal Links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            event.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // --- Set Current Year in Footer ---
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Sticky Header on Scroll ---
    const header = document.getElementById('header');
    if (header) {
        const updateHeader = function () {
            header.classList.toggle('scrolled', window.scrollY > 50);
        };

        window.addEventListener('scroll', updateHeader, { passive: true });
        updateHeader();
    }

    // --- Animate on Scroll for Cards/Steps/Testimonials ---
    const animatedElements = document.querySelectorAll('.step-item, .car-card, .testimonial-card');

    animatedElements.forEach(function (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const animateOnScroll = function () {
        const windowHeight = window.innerHeight;

        animatedElements.forEach(function (element) {
            if (element.getBoundingClientRect().top < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll, { passive: true });
    window.addEventListener('load', animateOnScroll, { once: true });
    animateOnScroll();
});
