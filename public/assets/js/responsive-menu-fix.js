/**
 * TourGo shared header controller.
 *
 * Owns theme, mobile navigation, and account/profile dropdown behavior for
 * public, customer, and agency pages. Page-level legacy handlers are blocked
 * through capture-phase listeners so one click produces one state change.
 */
(function () {
    'use strict';

    function getThemeToggle() {
        return document.querySelector('.tourgo-standard-header .theme-toggle, .theme-toggle');
    }

    function getMenuToggle() {
        return document.querySelector('.tourgo-standard-header .menu-toggle, .menu-toggle');
    }

    function getNavMenu() {
        return document.getElementById('mainNavMenu') || document.querySelector('.nav-menu');
    }

    function getProfileToggle() {
        return document.querySelector('.tourgo-standard-header .profile-toggle, .profile-toggle');
    }

    function getProfileMenu(toggle) {
        if (!toggle) return null;
        const dropdown = toggle.closest('.profile-dropdown');
        return dropdown ? dropdown.querySelector('.profile-menu') : document.querySelector('.profile-menu');
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
        try { localStorage.setItem('theme', normalized); } catch (_) {}
        document.cookie = 'theme=' + normalized + ';path=/;max-age=' + (365 * 24 * 60 * 60);
        const button = getThemeToggle();
        updateThemeIcon(normalized, button);
        if (button) {
            button.setAttribute('aria-pressed', normalized === 'dark' ? 'true' : 'false');
            button.setAttribute('aria-label', normalized === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
        return normalized;
    }

    function getStoredTheme() {
        let stored = null;
        try { stored = localStorage.getItem('theme'); } catch (_) {}
        if (stored === 'dark' || stored === 'light') return stored;

        const cookie = document.cookie.split('; ').find(function (row) {
            return row.indexOf('theme=') === 0;
        });
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

    function setProfileState(open, toggle, menu) {
        if (!toggle || !menu) return;
        menu.classList.toggle('active', open);
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function initThemeController() {
        const button = getThemeToggle();
        if (!button || button.dataset.tourgoThemeReady === 'true') return;
        button.dataset.tourgoThemeReady = 'true';
        button.type = 'button';

        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        }, true);

        applyTheme(getStoredTheme());
    }

    function initMenuController() {
        const button = getMenuToggle();
        const navMenu = getNavMenu();
        if (!button || !navMenu || button.dataset.tourgoMenuReady === 'true') return;

        button.dataset.tourgoMenuReady = 'true';
        button.type = 'button';
        button.setAttribute('aria-controls', navMenu.id || 'mainNavMenu');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Open navigation menu');

        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const profileToggle = getProfileToggle();
            const profileMenu = getProfileMenu(profileToggle);
            if (profileToggle && profileMenu) setProfileState(false, profileToggle, profileMenu);
            setMenuState(!navMenu.classList.contains('active'), button, navMenu);
        }, true);

        button.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopImmediatePropagation();
            button.click();
        }, true);

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuState(false, button, navMenu);
            });
        });

        document.addEventListener('click', function (event) {
            if (navMenu.classList.contains('active') && !navMenu.contains(event.target) && !button.contains(event.target)) {
                setMenuState(false, button, navMenu);
            }
        });
    }

    function initProfileController() {
        const toggle = getProfileToggle();
        const menu = getProfileMenu(toggle);
        if (!toggle || !menu || toggle.dataset.tourgoProfileReady === 'true') return;

        toggle.dataset.tourgoProfileReady = 'true';
        toggle.type = 'button';
        toggle.setAttribute('aria-controls', menu.id || 'profileMenu');
        toggle.setAttribute('aria-expanded', 'false');

        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const navButton = getMenuToggle();
            const navMenu = getNavMenu();
            if (navButton && navMenu) setMenuState(false, navButton, navMenu);
            setProfileState(!menu.classList.contains('active'), toggle, menu);
        }, true);

        menu.addEventListener('click', function (event) {
            event.stopPropagation();
        }, true);

        document.addEventListener('click', function (event) {
            if (menu.classList.contains('active') && !menu.contains(event.target) && !toggle.contains(event.target)) {
                setProfileState(false, toggle, menu);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                if (menu.classList.contains('active')) {
                    setProfileState(false, toggle, menu);
                    toggle.focus();
                }
                const navButton = getMenuToggle();
                const navMenu = getNavMenu();
                if (navButton && navMenu && navMenu.classList.contains('active')) {
                    setMenuState(false, navButton, navMenu);
                    navButton.focus();
                }
            }
        });
    }

    function handleResize() {
        const button = getMenuToggle();
        const navMenu = getNavMenu();
        if (button && navMenu && window.innerWidth > 991) {
            setMenuState(false, button, navMenu);
        }
    }

    function init() {
        initThemeController();
        initMenuController();
        initProfileController();
        window.addEventListener('resize', handleResize, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
