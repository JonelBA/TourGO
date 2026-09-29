(function (window) {
  'use strict';

  const DEFAULT_PASSWORD = 'Demo1234!';
  const PROFILE_KEY = 'tourgo_agency_profile';
  const FLEET_KEY = 'tourgo_agency_fleet';
  const BOOKING_KEY = 'tourgo_bookings';

  const baseFleet = [
    {id:1,make:'Toyota',model:'Vios',type:'Sedan',transmission:'Automatic',fuel:'Gasoline',seats:5,doors:4,price:2500,year:2024,mileage:'Unlimited',color:'Pearl White',engine:'1.3L 4-Cylinder',status:'available',popularity:86,rating:4.8,bookings:12,image:'../public/assets/images/car.png',description:'A practical and comfortable sedan for city trips, business travel, and everyday adventures.',location:'Adventure City'},
    {id:2,make:'Honda',model:'City',type:'Sedan',transmission:'CVT',fuel:'Gasoline',seats:5,doors:4,price:3000,year:2024,mileage:'Unlimited',color:'Modern Steel',engine:'1.5L i-VTEC',status:'available',popularity:91,rating:4.9,bookings:18,image:'../public/assets/images/car.png',description:'A refined compact sedan with a smooth CVT transmission and a comfortable interior.',location:'Adventure City'},
    {id:3,make:'Mitsubishi',model:'Xpander',type:'MPV',transmission:'Automatic',fuel:'Gasoline',seats:7,doors:5,price:4500,year:2025,mileage:'Unlimited',color:'Quartz White',engine:'1.5L MIVEC',status:'available',popularity:79,rating:4.7,bookings:9,image:'../public/assets/images/car.png',description:'A spacious 7-seater MPV built for family trips and group travel with flexible cabin space.',location:'Adventure City'},
    {id:4,make:'Toyota',model:'Fortuner',type:'SUV',transmission:'Automatic',fuel:'Diesel',seats:7,doors:5,price:5500,year:2025,mileage:'Unlimited',color:'Silver Metallic',engine:'2.4L Turbo Diesel',status:'available',popularity:95,rating:4.9,bookings:21,image:'../public/assets/images/car.png',description:'A spacious premium SUV with 7 seats, diesel power, and confident road presence.',location:'Adventure City'}
  ];

  function read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }

  function getProfile() {
    return Object.assign({companyName:'DriveHub Rentals',firstName:'Maria',lastName:'Santos',email:'agency@tourgo.demo',phone:'+63 900 000 0000',address:'123 Travel Street',city:'Adventure City',province:'AC',postalCode:'12345',country:'Philippines',businessType:'Corporation',registrationNumber:'TOURGO-DEMO-001',taxId:'DEMO-TIN-000',yearEstablished:'2021',website:'',description:'A demo rental agency showcasing TourGo\'s agency management tools.'}, read(PROFILE_KEY, {}));
  }
  function saveProfile(profile) { write(PROFILE_KEY, Object.assign(getProfile(), profile)); }

  function getFleet() {
    const custom = read(FLEET_KEY, []);
    const map = new Map(baseFleet.map(v => [Number(v.id), Object.assign({}, v)]));
    custom.forEach(v => map.set(Number(v.id), Object.assign({}, map.get(Number(v.id)) || {}, v)));
    return Array.from(map.values());
  }
  function saveFleet(fleet) {
    const baseMap = new Map(baseFleet.map(v => [Number(v.id), v]));
    const custom = fleet.filter(v => !baseMap.has(Number(v.id)) || JSON.stringify(v) !== JSON.stringify(baseMap.get(Number(v.id))));
    write(FLEET_KEY, custom);
  }
  function getBookings() { const b = read(BOOKING_KEY, []); return Array.isArray(b) ? b : []; }

  function setText(selector, value) { document.querySelectorAll(selector).forEach(el => { el.textContent = value; }); }

  function setupTheme() {
    // responsive-menu-fix.js is the single shared theme controller.
    // Keep this legacy function as a compatibility no-op when that
    // controller is present so the theme cannot toggle twice.
    const buttons = document.querySelectorAll('.theme-toggle');
    if (!buttons.length) return;

    if (buttons[0].dataset.tourgoThemeReady === 'true') return;

    const apply = theme => {
      const normalized = theme === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', normalized);
      try { localStorage.setItem('theme', normalized); } catch (_) {}
      buttons.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) icon.className = normalized === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      });
    };

    apply(localStorage.getItem('theme') || 'light');
    buttons.forEach(btn => btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
    }));
  }

  function setupMenus() {
    const toggle = document.getElementById('profileToggleBtn');
    const menu = document.getElementById('profileMenu');
    if (toggle && menu && toggle.dataset.tourgoProfileReady !== 'true') {
      toggle.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('active'); toggle.classList.toggle('active'); });
      menu.addEventListener('click', e => e.stopPropagation());
      document.addEventListener('click', () => { menu.classList.remove('active'); toggle.classList.remove('active'); toggle.setAttribute('aria-expanded', 'false'); });
    }
    const menuBtn = document.getElementById('menuToggleBtn');
    const nav = document.getElementById('mainNavMenu');
    if (menuBtn && nav && menuBtn.dataset.tourgoMenuReady !== 'true') {
      // Only attach the legacy fallback if the shared controller has not
      // initialized this menu.
      menuBtn.addEventListener('click', e => {
        e.stopPropagation();
        nav.classList.toggle('active');
        menuBtn.classList.toggle('active');
      });
      document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
          nav.classList.remove('active');
          menuBtn.classList.remove('active');
        }
      });
    }
  }

  function setupIdentity() {
    const p = getProfile();
    const displayName = p.companyName || 'DriveHub Rentals';
    document.querySelectorAll('.profile-name').forEach(el => el.textContent = displayName);
    document.querySelectorAll('.profile-toggle img').forEach(img => { img.src = '../public/assets/images/guest-avatar.svg'; img.alt = displayName + ' Logo'; });
    document.querySelectorAll('#agencyNameGreeting').forEach(el => el.textContent = displayName);
    setText('#headerCompanyName, #navCompanyName', displayName);
    const logo = document.getElementById('headerAgencyLogo');
    if (logo) { logo.src = '../public/assets/images/guest-avatar.svg'; logo.alt = displayName + ' Logo'; }
    const navLogo = document.getElementById('navAgencyLogo');
    if (navLogo) { navLogo.src = '../public/assets/images/guest-avatar.svg'; navLogo.alt = displayName + ' Logo'; }
    setText('#currentYear', new Date().getFullYear());
  }

  function toast(message, type) {
    let el = document.getElementById('agencyDemoToast');
    if (!el) { el = document.createElement('div'); el.id='agencyDemoToast'; document.body.appendChild(el); Object.assign(el.style,{position:'fixed',right:'22px',bottom:'22px',zIndex:'9999',padding:'12px 16px',borderRadius:'10px',background:'var(--white)',boxShadow:'0 12px 32px rgba(0,0,0,.18)',color:'var(--text-dark)',border:'1px solid rgba(77,148,255,.15)',transition:'opacity .2s'}); }
    el.textContent = message; el.style.opacity='1'; if (type==='error') el.style.borderColor='rgba(220,53,69,.35)';
    clearTimeout(el._timer); el._timer = setTimeout(()=>el.style.opacity='0', 2400);
  }

  function setupNewsletterForms() {
    document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', e => { e.preventDefault(); const input=form.querySelector('input[type="email"]'); if (input && input.value.trim()) { toast('Thanks! You are subscribed.'); input.value=''; } else toast('Enter an email address first.','error'); }));
  }

  function setupGenericForms() {
    document.querySelectorAll('form[data-demo-submit="true"]').forEach(form => form.addEventListener('submit', e => { e.preventDefault(); }));
  }

  window.TourGoAgencyDemo = { baseFleet, getFleet, saveFleet, getBookings, getProfile, saveProfile, toast, DEFAULT_PASSWORD };

  document.addEventListener('DOMContentLoaded', () => { setupTheme(); setupMenus(); setupIdentity(); setupNewsletterForms(); setupGenericForms(); });
})(window);
