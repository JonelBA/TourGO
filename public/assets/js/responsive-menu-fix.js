/**
 * TourGO shared header controller
 *
 * This file is intentionally kept under the existing filename so every page
 * that already loads responsive-menu-fix.js continues to work without HTML
 * path changes. It is now the single controller for the public/customer/
 * agency mobile menu and theme toggle.
 */
(function () {
    'use strict';

    function getThemeToggle() {
        return document.querySelector('.theme-toggle');
    }

    function getMenuToggle() {
        return document.querySelector('.menu-toggle');
    }

    function getNavMenu() {
        return document.getElementById('mainNavMenu') || document.querySelector('.nav-menu');
    }

    function updateThemeIcon(theme, button) {
        if (!button) return;
        const icon = button.querySelector('i');
        if (!icon) return;

        icon.classList.toggle('fa-moon', theme !== 'dark');
        icon.classList.toggle('fa-sun', theme === 'dark');
    }

    function applyTheme(theme) {
        const normalized = theme === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', normalized);
        localStorage.setItem('theme', normalized);

        // Keep the existing cookie used by the original TourGO PHP frontend.
        document.cookie = 'theme=' + normalized + ';path=/;max-age=' + (365 * 24 * 60 * 60);

        updateThemeIcon(normalized, getThemeToggle());
        return normalized;
    }

    function getStoredTheme() {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored;

        const cookie = document.cookie
            .split('; ')
            .find(function (row) { return row.indexOf('theme=') === 0; });

        if (cookie) {
            const value = cookie.split('=')[1];
            if (value === 'dark' || value === 'light') return value;
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    function setMenuState(open, button, navMenu) {
        if (!button || !navMenu) return;

        navMenu.classList.toggle('active', open);
        button.classList.toggle('active', open);
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');

        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        }
    }

    function initThemeController() {
        const button = getThemeToggle();
        if (!button || button.dataset.tourgoThemeReady === 'true') return;

        button.dataset.tourgoThemeReady = 'true';
        button.type = 'button';
        button.setAttribute('aria-pressed', 'false');

        // Capture phase intentionally prevents older inline theme handlers
        // from toggling the theme a second time.
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            const current = document.documentElement.getAttribute('data-theme') === 'dark'
                ? 'dark'
                : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            button.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
        }, true);

        const initial = applyTheme(getStoredTheme());
        button.setAttribute('aria-pressed', initial === 'dark' ? 'true' : 'false');
    }

    function isCustomerOrAgencyPage() {
        const path = window.location.pathname.toLowerCase();
        return /\/(customer|agency)(?:\/|$)/.test(path);
    }

    function disableCustomerAgencyHamburger() {
        if (!isCustomerOrAgencyPage()) return false;

        document.documentElement.setAttribute('data-tourgo-no-hamburger', 'true');
        document.querySelectorAll('.menu-toggle').forEach(function (button) {
            button.setAttribute('aria-hidden', 'true');
            button.setAttribute('tabindex', '-1');
            button.setAttribute('aria-expanded', 'false');
            button.disabled = true;
            button.style.setProperty('display', 'none', 'important');
        });
        return true;
    }

    function initMenuController() {
        if (disableCustomerAgencyHamburger()) return;

        const button = getMenuToggle();
        const navMenu = getNavMenu();

        if (!button || !navMenu || button.dataset.tourgoMenuReady === 'true') return;

        button.dataset.tourgoMenuReady = 'true';
        button.type = 'button';
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        button.setAttribute('aria-controls', navMenu.id || 'mainNavMenu');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Open navigation menu');

        function toggle() {
            setMenuState(!navMenu.classList.contains('active'), button, navMenu);
        }

        // Capture phase prevents old inline/page-specific handlers from
        // toggling the menu a second time.
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            toggle();
        }, true);

        button.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopImmediatePropagation();
            toggle();
        }, true);

        document.addEventListener('click', function (event) {
            if (!navMenu.classList.contains('active')) return;
            if (!navMenu.contains(event.target) && !button.contains(event.target)) {
                setMenuState(false, button, navMenu);
            }
        });

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuState(false, button, navMenu);
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                setMenuState(false, button, navMenu);
                button.focus();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 992) {
                setMenuState(false, button, navMenu);
            }
        });
    }

    function init() {
        initThemeController();
        initMenuController();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
