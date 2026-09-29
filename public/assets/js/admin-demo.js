(function (window, document) {
    'use strict';

    const KEYS = {
        accounts: 'tourgo_demo_accounts',
        session: 'tourgo_demo_session',
        theme: 'theme',
        bookings: 'tourgo_demo_bookings',
        vehicles: 'tourgo_admin_vehicles',
        overrides: 'tourgo_admin_user_overrides',
        complaints: 'tourgo_support_requests'
    };

    const builtInAccounts = {
        'admin@tourgo.demo': {
            password: 'TourGOAdmin@2026!', role: 'admin', name: 'TourGO Administrator',
            createdAt: '2026-09-20T08:00:00Z', id: 1001, active: true, verification: 'approved'
        },
        'agency@tourgo.demo': {
            password: 'Demo1234!', role: 'agency', name: 'DriveHub Rentals',
            createdAt: '2026-09-20T08:30:00Z', id: 1002, active: true, verification: 'approved'
        },
        'customer@tourgo.demo': {
            password: 'Demo1234!', role: 'customer', name: 'Guest',
            createdAt: '2026-09-20T09:00:00Z', id: 1003, active: true, verification: 'pending'
        }
    };

    const fallbackFleet = [
        { id: 1, make: 'Toyota', model: 'Vios', type: 'Sedan', transmission: 'Automatic', fuel: 'Gasoline', seats: 5, price: 2500, year: 2024, image: 'car.png', description: 'A practical and comfortable sedan for city trips, business travel, and everyday adventures.', doors: 4, luggage: 2, mileage: 'Unlimited', color: 'Pearl White', agency: 'DriveHub Rentals', licensePlate: 'TGO-101', popularity: 86, rating: 4.8, bookings: 0, status: 'available', addedDate: '2026-09-20', location: 'Adventure City' },
        { id: 2, make: 'Honda', model: 'City', type: 'Sedan', transmission: 'CVT', fuel: 'Gasoline', seats: 5, price: 3000, year: 2024, image: 'car.png', description: 'A refined compact sedan with a smooth CVT transmission and a comfortable interior.', doors: 4, luggage: 2, mileage: 'Unlimited', color: 'Modern Steel', agency: 'DriveHub Rentals', licensePlate: 'TGO-202', popularity: 78, rating: 4.7, bookings: 0, status: 'available', addedDate: '2026-09-20', location: 'Adventure City' },
        { id: 3, make: 'Mitsubishi', model: 'Xpander', type: 'MPV', transmission: 'Automatic', fuel: 'Gasoline', seats: 7, price: 4500, year: 2025, image: 'car.png', description: 'A spacious 7-seater MPV built for family trips and group travel with flexible cabin space.', doors: 5, luggage: 3, mileage: 'Unlimited', color: 'Quartz White', agency: 'DriveHub Rentals', licensePlate: 'TGO-303', popularity: 91, rating: 4.9, bookings: 0, status: 'available', addedDate: '2026-09-21', location: 'Adventure City' },
        { id: 4, make: 'Toyota', model: 'Fortuner', type: 'SUV', transmission: 'Automatic', fuel: 'Diesel', seats: 7, price: 5500, year: 2025, image: 'car.png', description: 'A spacious premium SUV with 7 seats, diesel power, and confident road presence.', doors: 5, luggage: 3, mileage: 'Unlimited', color: 'Silver Metallic', agency: 'DriveHub Rentals', licensePlate: 'TGO-404', popularity: 95, rating: 4.9, bookings: 0, status: 'available', addedDate: '2026-09-21', location: 'Adventure City' }
    ];

    const BASE = '../public/assets/';
    const avatar = BASE + 'images/guest-avatar.svg';
    const carImage = BASE + 'images/car.png';

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (_) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
    }

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
        });
    }

    function fmtDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    }

    function fmtDateTime(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    }

    function fmtMoney(value) {
        return '₱' + Number(value || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        });
    }

    function capitalize(value) {
        const text = String(value || '');
        return text ? text.charAt(0).toUpperCase() + text.slice(1).replace('_', ' ') : '';
    }

    function getAccounts() {
        const stored = readJSON(KEYS.accounts, {});
        const merged = {};
        Object.keys(builtInAccounts).forEach(function (email) {
            merged[email] = Object.assign({}, builtInAccounts[email]);
        });
        Object.keys(stored || {}).forEach(function (email) {
            merged[email] = Object.assign({}, merged[email] || {}, stored[email]);
        });
        return merged;
    }

    function getOverrides() {
        return readJSON(KEYS.overrides, {});
    }

    function getVehicles() {
        let vehicles = readJSON(KEYS.vehicles, null);
        if (!Array.isArray(vehicles) || !vehicles.length) {
            vehicles = (window.TourGoDemoFleet || fallbackFleet).map(function (vehicle) {
                return Object.assign({}, vehicle, {
                    agency: vehicle.agency || 'DriveHub Rentals',
                    licensePlate: vehicle.licensePlate || ('TGO-' + String(vehicle.id).padStart(3, '0')),
                    popularity: Number(vehicle.popularity || 80),
                    rating: Number(vehicle.rating || 4.8),
                    bookings: Number(vehicle.bookings || 0),
                    status: vehicle.status || 'available',
                    addedDate: vehicle.addedDate || new Date().toISOString().slice(0, 10),
                    location: vehicle.location || 'Adventure City'
                });
            });
            writeJSON(KEYS.vehicles, vehicles);
        }
        return vehicles;
    }

    function getBookings() {
        const bookings = readJSON(KEYS.bookings, []);
        return Array.isArray(bookings) ? bookings : [];
    }

    function getComplaints() {
        const complaints = readJSON(KEYS.complaints, []);
        return Array.isArray(complaints) ? complaints : [];
    }

    function userForId(id) {
        const overrides = getOverrides();
        const accounts = getAccounts();
        return Object.keys(accounts).map(function (email, index) {
            const account = accounts[email];
            const user = Object.assign({
                id: account.id || 1000 + index,
                email: email,
                name: account.name || email.split('@')[0],
                role: account.role || 'customer',
                createdAt: account.createdAt || '2026-09-20T08:00:00Z',
                active: true,
                verification: account.role === 'agency' ? 'approved' : account.role === 'customer' ? 'pending' : 'approved'
            }, account);
            user.id = Number(user.id);
            if (overrides[user.id]) Object.assign(user, overrides[user.id]);
            return user;
        }).find(function (user) { return Number(user.id) === Number(id); }) || null;
    }

    function allUsers() {
        const accounts = getAccounts();
        const overrides = getOverrides();
        return Object.keys(accounts).map(function (email, index) {
            const account = accounts[email];
            const user = Object.assign({
                id: account.id || 1000 + index,
                email: email,
                name: account.name || email.split('@')[0],
                role: account.role || 'customer',
                createdAt: account.createdAt || '2026-09-20T08:00:00Z',
                active: true,
                verification: account.role === 'agency' ? 'approved' : account.role === 'customer' ? 'pending' : 'approved'
            }, account);
            user.id = Number(user.id);
            if (overrides[user.id]) Object.assign(user, overrides[user.id]);
            return user;
        }).filter(function (user) { return user.role !== 'admin'; });
    }

    function bookingNormalized(booking, index) {
        const vehicles = getVehicles();
        const name = booking.vehicleName || [booking.make, booking.model].filter(Boolean).join(' ') || 'Rental Vehicle';
        const vehicle = vehicles.find(function (v) { return Number(v.id) === Number(booking.vehicleId); }) ||
            vehicles.find(function (v) { return (v.make + ' ' + v.model).toLowerCase() === name.toLowerCase(); });
        const accounts = getAccounts();
        const account = booking.customerEmail ? accounts[booking.customerEmail] : null;
        const pickup = booking.pickupDate || new Date().toISOString().slice(0, 10);
        const ret = booking.returnDate || pickup;
        const dateDiff = Math.round((new Date(ret) - new Date(pickup)) / 86400000);
        const days = Math.max(1, dateDiff + 1);
        return Object.assign({}, booking, {
            bookingId: booking.bookingId || ('DEMO-' + String(index + 1).padStart(4, '0')),
            vehicleId: booking.vehicleId || (vehicle && vehicle.id),
            vehicleName: name,
            make: booking.make || (vehicle && vehicle.make) || '',
            model: booking.model || (vehicle && vehicle.model) || '',
            vehicleType: booking.vehicleType || (vehicle && vehicle.type) || 'Vehicle',
            licensePlate: booking.licensePlate || (vehicle && vehicle.licensePlate) || 'DEMO-000',
            imagePath: booking.imagePath || carImage,
            customerName: booking.customerName || (account && account.name) || 'Guest',
            customerEmail: booking.customerEmail || 'customer@tourgo.demo',
            customerPhone: booking.customerPhone || '+63 900 000 0000',
            agencyName: booking.agencyName || 'DriveHub Rentals',
            pickupDate: pickup,
            returnDate: ret,
            bookingDate: booking.createdAt || booking.bookingDate || new Date().toISOString(),
            status: String(booking.status || 'confirmed').toLowerCase(),
            paymentStatus: String(booking.paymentStatus || 'pending').toLowerCase(),
            transactionId: booking.transactionId || '',
            paymentMethod: booking.paymentMethod || booking.payment_method || 'Demo',
            totalAmount: Number(booking.totalAmount || (Number(booking.dailyRate || (vehicle && vehicle.price) || 0) * days)),
            dailyRate: Number(booking.dailyRate || (vehicle && vehicle.price) || 0),
            days: days
        });
    }

    function setHeaderIdentity() {
        const toggle = document.querySelector('.profile-toggle');
        if (toggle) {
            const image = toggle.querySelector('img');
            const label = toggle.querySelector('span');
            if (image) { image.src = avatar; image.alt = 'Admin'; }
            if (label) label.textContent = 'Admin';
        }
        document.querySelectorAll('a[href="admin_reports.html"]').forEach(function (a) { a.href = 'reports.html'; });
        document.querySelectorAll('a[href="admin_profile.html"]').forEach(function (a) { a.href = 'admin_dashboard.html'; });
        document.querySelectorAll('a[href="delete_vehicle.html"]').forEach(function (a) { a.href = '#'; });
        document.querySelectorAll('a[href*="delete_user.html"]').forEach(function (a) { a.href = '#'; a.removeAttribute('onclick'); });
        document.querySelectorAll('a[href*="view_booking.html?id="]').forEach(function (a) { a.href = 'view_booking.html' + (a.href.includes('id=') ? a.href.substring(a.href.indexOf('id=')) : ''); });
    }

    function initCommon() {
        setHeaderIdentity();
        const root = document.documentElement;
        const toggle = document.querySelector('.theme-toggle');
        const icon = toggle && toggle.querySelector('i');
        const savedTheme = localStorage.getItem(KEYS.theme) || 'light';
        root.setAttribute('data-theme', savedTheme);
        if (icon) icon.className = 'fas ' + (savedTheme === 'dark' ? 'fa-sun' : 'fa-moon');
        if (toggle && toggle.dataset.bound !== '1') {
            toggle.dataset.bound = '1';
            toggle.addEventListener('click', function () {
                const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                root.setAttribute('data-theme', next);
                localStorage.setItem(KEYS.theme, next);
                if (icon) icon.className = 'fas ' + (next === 'dark' ? 'fa-sun' : 'fa-moon');
                window.dispatchEvent(new CustomEvent('tourgo:themechange'));
                updateChartsTheme();
            });
        }

        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        if (menuToggle && sidebar && menuToggle.dataset.bound !== '1') {
            menuToggle.dataset.bound = '1';

            let backdrop = document.querySelector('.sidebar-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'sidebar-backdrop';
                document.body.appendChild(backdrop);
            }

            function closeSidebar() {
                document.body.classList.remove('sidebar-collapsed');
                sidebar.classList.remove('active');
                backdrop.classList.remove('active');
            }

            function syncSidebarState() {
                const isMobile = window.innerWidth <= 992;
                if (isMobile) {
                    const open = sidebar.classList.contains('active');
                    document.body.classList.remove('sidebar-collapsed');
                    backdrop.classList.toggle('active', open);
                } else {
                    backdrop.classList.remove('active');
                    sidebar.classList.remove('active');
                }
            }

            menuToggle.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                const isMobile = window.innerWidth <= 992;
                if (isMobile) {
                    sidebar.classList.toggle('active');
                    backdrop.classList.toggle('active', sidebar.classList.contains('active'));
                    document.body.classList.remove('sidebar-collapsed');
                } else {
                    document.body.classList.toggle('sidebar-collapsed');
                }
            });

            backdrop.addEventListener('click', closeSidebar);

            document.addEventListener('click', function (event) {
                if (window.innerWidth <= 992 && sidebar.classList.contains('active') &&
                    !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                    closeSidebar();
                }
            });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') closeSidebar();
            });

            window.addEventListener('resize', syncSidebarState);
            syncSidebarState();
        }

        const year = document.getElementById('currentYear');
        if (year && !year.textContent.trim()) year.textContent = String(new Date().getFullYear());
    }

    function updateChartsTheme() {
        if (window.Chart) {
            document.dispatchEvent(new CustomEvent('tourgo:charts-refresh'));
        }
    }

    function statTrend(value) {
        const direction = value >= 0 ? 'up' : 'down';
        const arrow = value >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        return { direction: direction, html: '<i class="fas ' + arrow + '"></i> ' + Math.abs(value) + '% this month' };
    }

    function populateDashboard() {
        const users = allUsers();
        const bookings = getBookings().map(bookingNormalized);
        const vehicles = getVehicles();
        const customers = users.filter(function (u) { return u.role === 'customer'; }).length;
        const agencies = users.filter(function (u) { return u.role === 'agency'; }).length;
        const stats = document.querySelectorAll('.dashboard-stats .stat-card');
        const values = [users.length, customers, agencies, bookings.length];
        stats.forEach(function (card, index) {
            const value = card.querySelector('.stat-card-value');
            if (value) value.textContent = String(values[index] || 0);
            const trend = card.querySelector('.stat-card-trend');
            if (trend) {
                const result = statTrend(0);
                trend.className = 'stat-card-trend trend-' + result.direction;
                trend.innerHTML = result.html;
            }
        });

        const sections = Array.from(document.querySelectorAll('.dashboard-section'));
        const findSection = function (name) {
            return sections.find(function (section) {
                const title = section.querySelector('.section-title');
                return title && title.textContent.trim() === name;
            });
        };

        const userSection = findSection('All Users');
        if (userSection) {
            const tbody = userSection.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = users.length ? users.map(function (u) {
                    return '<tr>' +
                        '<td><div class="user-info"><img src="' + avatar + '" alt="User Avatar" class="user-avatar"><div>' + esc(u.name) + '</div></div></td>' +
                        '<td>' + esc(u.email) + '</td>' +
                        '<td><span class="badge badge-' + esc(u.role) + '">' + capitalize(u.role) + '</span></td>' +
                        '<td>' + fmtDate(u.createdAt) + '</td>' +
                        '<td><span class="status-badge ' + (u.active ? 'active' : 'inactive') + '">' + (u.active ? 'Active' : 'Inactive') + '</span> <span class="status-badge ' + esc(u.verification) + '">' + capitalize(u.verification) + '</span></td>' +
                        '<td><div class="actions"><a href="admin_user_view.html?id=' + u.id + '" class="btn btn-sm btn-view" title="View"><i class="fas fa-eye"></i></a><a href="admin_user_edit.html?id=' + u.id + '" class="btn btn-sm btn-edit" title="Edit"><i class="fas fa-edit"></i></a><button type="button" class="btn btn-sm btn-delete" data-delete-user="' + u.id + '" title="Deactivate"><i class="fas fa-user-slash"></i></button></div></td>' +
                        '</tr>';
                }).join('') : '<tr><td colspan="6"><div class="no-data-message"><i class="fas fa-users-slash"></i><p>No users found.</p></div></td></tr>';
            }
        }

        const vehicleSection = findSection('Recent Vehicles');
        if (vehicleSection) {
            const tbody = vehicleSection.querySelector('tbody');
            if (tbody) {
                const recentVehicles = vehicles.slice().sort(function (a, b) { return new Date(b.addedDate) - new Date(a.addedDate); }).slice(0, 4);
                tbody.innerHTML = recentVehicles.map(function (v) {
                    return '<tr>' +
                        '<td><div class="vehicle-info"><img src="' + carImage + '" alt="' + esc(v.make + ' ' + v.model) + '" class="vehicle-thumbnail"><span>' + esc(v.make + ' ' + v.model) + '</span></div></td>' +
                        '<td>' + esc(v.type) + '</td><td>' + esc(v.agency) + '</td>' +
                        '<td><span class="status-badge ' + (v.status === 'available' ? 'available' : 'unavailable') + '">' + capitalize(v.status) + '</span></td>' +
                        '<td>' + fmtDate(v.addedDate) + '</td>' +
                        '<td><div class="actions"><a href="view_vehicle.html?id=' + v.id + '" class="btn btn-sm btn-view" title="View"><i class="fas fa-eye"></i></a></div></td>' +
                        '</tr>';
                }).join('');
            }
        }

        const bookingSection = findSection('Recent Bookings');
        if (bookingSection) {
            const tbody = bookingSection.querySelector('tbody');
            if (tbody) {
                const recentBookings = bookings.slice().sort(function (a, b) { return new Date(b.bookingDate) - new Date(a.bookingDate); }).slice(0, 5);
                tbody.innerHTML = recentBookings.length ? recentBookings.map(function (b) {
                    return '<tr><td>#' + esc(b.bookingId) + '</td><td>' + esc(b.customerName) + '</td><td>' + esc(b.vehicleName) + '</td><td><span class="status-badge status-' + esc(b.status) + '">' + capitalize(b.status) + '</span></td><td>' + fmtDate(b.bookingDate) + '</td><td><a href="view_booking.html?id=' + encodeURIComponent(b.bookingId) + '" class="btn btn-sm btn-view" title="View"><i class="fas fa-eye"></i></a></td></tr>';
                }).join('') : '<tr><td colspan="6"><div class="no-data-message"><i class="fas fa-calendar-times"></i><p>No bookings found.</p></div></td></tr>';
            }
        }

        renderDashboardCharts(bookings, users, vehicles);

        document.querySelectorAll('[data-delete-user]').forEach(function (button) {
            button.addEventListener('click', function () {
                const id = Number(button.dataset.deleteUser);
                if (!window.confirm('Deactivate this user in the demo?')) return;
                const overrides = getOverrides();
                overrides[id] = Object.assign({}, overrides[id], { active: false });
                writeJSON(KEYS.overrides, overrides);
                populateDashboard();
            });
        });
    }

    let chartRefs = [];

    function destroyCharts() {
        chartRefs.forEach(function (chart) { try { chart.destroy(); } catch (_) {} });
        chartRefs = [];
    }

    function renderDashboardCharts(bookings, users, vehicles) {
        if (!window.Chart) return;
        destroyCharts();
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        const text = dark ? 'rgba(255,255,255,.78)' : '#495057';
        const grid = dark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.08)';
        const monthData = Array.from({ length: 12 }, function (_, month) {
            return bookings.filter(function (b) {
                const date = new Date(b.bookingDate);
                return date.getMonth() === month;
            }).length;
        });
        const userData = [users.filter(function (u) { return u.role === 'customer'; }).length, users.filter(function (u) { return u.role === 'agency'; }).length];
        const categoryMap = {};
        vehicles.forEach(function (v) { categoryMap[v.type] = (categoryMap[v.type] || 0) + 1; });
        const labels = Object.keys(categoryMap);

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: text } } },
            scales: {
                x: { ticks: { color: text }, grid: { color: grid } },
                y: { beginAtZero: true, precision: 0, ticks: { color: text }, grid: { color: grid } }
            }
        };

        const bookingCanvas = document.getElementById('bookingsChart');
        if (bookingCanvas) {
            chartRefs.push(new Chart(bookingCanvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                    datasets: [{ label: 'Bookings', data: monthData, fill: true, backgroundColor: 'rgba(77,148,255,.18)', borderColor: '#4d94ff', tension: .35, pointRadius: 4, pointBackgroundColor: '#4d94ff' }]
                }, options: chartOptions
            }));
        }
        const userCanvas = document.getElementById('userDistributionChart');
        if (userCanvas) {
            chartRefs.push(new Chart(userCanvas.getContext('2d'), {
                type: 'doughnut',
                data: { labels: ['Customers', 'Agencies'], datasets: [{ data: userData, backgroundColor: ['#4d94ff', '#28a745'], borderWidth: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: text } } } }
            }));
        }
        const categoryCanvas = document.getElementById('vehicleCategoriesChart');
        if (categoryCanvas) {
            chartRefs.push(new Chart(categoryCanvas.getContext('2d'), {
                type: 'bar',
                data: { labels: labels.length ? labels : ['No vehicles'], datasets: [{ label: 'Vehicles', data: labels.length ? labels.map(function (label) { return categoryMap[label]; }) : [0], backgroundColor: '#4d94ff' }] },
                options: chartOptions
            }));
        }
    }

    function populateVehicles() {
        const wrapper = document.querySelector('#grid-view .vehicles-grid');
        if (!wrapper) return;
        const form = document.getElementById('searchFilterSortForm');
        const search = form && form.querySelector('[name="search"]');
        const filter = form && form.querySelector('[name="filter"]');
        const sort = form && form.querySelector('[name="sort"]');
        if (form) form.addEventListener('submit', function (event) { event.preventDefault(); });
        if (document.querySelector('.pagination')) document.querySelector('.pagination').remove();

        function render() {
            let list = getVehicles().slice();
            const term = (search && search.value || '').trim().toLowerCase();
            const filterValue = filter ? filter.value : 'all';
            const sortValue = sort ? sort.value : 'newest';
            if (term) list = list.filter(function (v) { return (v.make + ' ' + v.model + ' ' + v.type + ' ' + v.agency).toLowerCase().includes(term); });
            if (filterValue === 'available') list = list.filter(function (v) { return v.status === 'available'; });
            if (filterValue === 'unavailable') list = list.filter(function (v) { return v.status !== 'available'; });
            if (sortValue === 'price_low') list.sort(function (a,b){ return a.price-b.price; });
            else if (sortValue === 'price_high') list.sort(function (a,b){ return b.price-a.price; });
            else if (sortValue === 'popular') list.sort(function (a,b){ return b.popularity-a.popularity; });
            else list.sort(function (a,b){ return new Date(b.addedDate)-new Date(a.addedDate); });

            wrapper.innerHTML = list.length ? list.map(function (v) {
                return '<div class="vehicle-card"><div class="vehicle-image"><img src="' + carImage + '" alt="' + esc(v.make + ' ' + v.model) + '"><div class="vehicle-status status-' + esc(v.status) + '">' + capitalize(v.status) + '</div></div>' +
                    '<div class="vehicle-details"><h3 class="vehicle-title">' + esc(v.make + ' ' + v.model + ' (' + v.year + ')') + '</h3>' +
                    '<div class="agency-info"><i class="fas fa-building"></i> ' + esc(v.agency) + '</div>' +
                    '<div class="vehicle-features"><span class="feature"><i class="fas fa-users"></i> ' + v.seats + ' Seats</span><span class="feature"><i class="fas fa-cogs"></i> ' + esc(v.transmission) + '</span><span class="feature"><i class="fas fa-gas-pump"></i> ' + esc(v.fuel) + '</span></div>' +
                    '<div class="vehicle-meta"><span class="vehicle-price">' + fmtMoney(v.price) + '<span class="price-period">/day</span></span><span class="vehicle-type-badge">' + esc(v.type) + '</span></div>' +
                    '<div class="vehicle-stats"><div class="stat"><span class="stat-value">' + v.popularity + '%</span><span class="stat-label">Popularity</span></div><div class="stat"><span class="stat-value">' + Number(v.rating).toFixed(1) + ' <i class="fas fa-star" style="color:#fdcc0d"></i></span><span class="stat-label">Rating</span></div><div class="stat"><span class="stat-value">' + v.bookings + '</span><span class="stat-label">Bookings</span></div></div>' +
                    '<div class="vehicle-actions"><a href="view_vehicle.html?id=' + v.id + '" class="btn btn-outline btn-icon"><i class="fas fa-eye"></i> View</a><button type="button" class="btn btn-danger-outline btn-icon delete-vehicle-btn" data-id="' + v.id + '"><i class="fas fa-trash-alt"></i> Delete</button></div></div></div>';
            }).join('') : '<div class="no-data-message"><i class="fas fa-car-side"></i><h3>No vehicles found</h3><p>No vehicles match your current filter or search criteria.</p></div>';

            wrapper.querySelectorAll('.delete-vehicle-btn').forEach(function (button) {
                button.addEventListener('click', function () {
                    const id = Number(button.dataset.id);
                    if (!window.confirm('Delete this vehicle from the demo fleet?')) return;
                    writeJSON(KEYS.vehicles, getVehicles().filter(function (v) { return Number(v.id) !== id; }));
                    render();
                });
            });
        }
        [search, filter, sort].forEach(function (element) { if (element) element.addEventListener('input', render); });
        render();
    }

    function populateBookings() {
        const container = document.querySelector('.bookings-container');
        if (!container) return;
        const search = document.getElementById('searchInput');
        const status = document.getElementById('statusFilter');
        const from = document.getElementById('dateFrom');
        const to = document.getElementById('dateTo');
        function render() {
            let list = getBookings().map(bookingNormalized);
            const term = (search && search.value || '').trim().toLowerCase();
            const state = (status && status.value || '').toLowerCase();
            if (term) list = list.filter(function (b) { return (b.bookingId + ' ' + b.customerName + ' ' + b.vehicleName + ' ' + b.agencyName).toLowerCase().includes(term); });
            if (state) list = list.filter(function (b) { return b.status === state; });
            if (from && from.value) list = list.filter(function (b) { return new Date(b.bookingDate) >= new Date(from.value); });
            if (to && to.value) list = list.filter(function (b) { return new Date(b.bookingDate) <= new Date(to.value + 'T23:59:59'); });
            container.innerHTML = list.length ? list.map(function (b) {
                return '<div class="booking-card" data-booking-id="' + esc(b.bookingId) + '"><div class="booking-header"><div><span class="booking-id">#' + esc(b.bookingId) + '</span><span class="booking-date">' + fmtDate(b.bookingDate) + '</span></div><span class="status-badge ' + esc(b.status) + '">' + capitalize(b.status) + '</span></div>' +
                    '<div class="booking-content"><div class="vehicle-image-container"><img src="' + carImage + '" alt="' + esc(b.vehicleName) + '" class="vehicle-image"></div><div class="booking-details">' +
                    '<div class="detail-group"><span class="detail-label">Customer</span><div class="customer-info"><img src="' + avatar + '" alt="Customer" class="customer-avatar"><span class="detail-value">' + esc(b.customerName) + '</span></div></div>' +
                    '<div class="detail-group"><span class="detail-label">Vehicle</span><span class="detail-value">' + esc(b.vehicleName) + ' (' + esc(b.licensePlate) + ')</span></div>' +
                    '<div class="detail-group"><span class="detail-label">Agency</span><div class="agency-info"><img src="' + avatar + '" alt="Agency" class="agency-logo"><span class="detail-value">' + esc(b.agencyName) + '</span></div></div>' +
                    '<div class="detail-group"><span class="detail-label">Rental Period</span><span class="detail-value">' + fmtDate(b.pickupDate) + ' - ' + fmtDate(b.returnDate) + '</span></div>' +
                    '<div class="detail-group"><span class="detail-label">Payment Status</span><span class="detail-value">' + capitalize(b.paymentStatus) + (b.transactionId ? ' <small>(' + esc(b.transactionId) + ')</small>' : '') + '</span></div>' +
                    '</div></div><div class="booking-footer"><div class="amount">' + fmtMoney(b.totalAmount) + '</div><div class="booking-actions"><a href="view_booking.html?id=' + encodeURIComponent(b.bookingId) + '" class="btn-action btn-view"><i class="fas fa-eye"></i> View Details</a><button type="button" class="btn-action btn-delete" data-delete-booking="' + esc(b.bookingId) + '"><i class="fas fa-trash"></i> Delete</button></div></div></div>';
            }).join('') : '<div class="no-results"><i class="fas fa-calendar-times"></i><p>No bookings found</p></div>';
            container.querySelectorAll('[data-delete-booking]').forEach(function (button) {
                button.addEventListener('click', function () {
                    if (!window.confirm('Delete this booking from the demo?')) return;
                    const id = button.dataset.deleteBooking;
                    writeJSON(KEYS.bookings, getBookings().filter(function (b) { return String(b.bookingId || '') !== String(id); }));
                    render();
                });
            });
        }
        [search, status, from, to].forEach(function (element) { if (element) element.addEventListener('input', render); });
        render();
    }

    function bindUserTabs() {
        document.querySelectorAll('.tab-btn[data-tab]').forEach(function (button) {
            if (button.dataset.tabBound === '1') return;
            button.dataset.tabBound = '1';
            button.addEventListener('click', function () {
                const target = button.dataset.tab;
                document.querySelectorAll('.tab-btn[data-tab]').forEach(function (btn) { btn.classList.toggle('active', btn === button); });
                document.querySelectorAll('.tab-content[id]').forEach(function (content) { content.classList.toggle('active', content.id === target); });
            });
        });
    }

    function populateManageUsers() {
        bindUserTabs();
        const users = allUsers();
        const pending = users.filter(function (u) { return u.verification === 'pending'; });
        const statValues = document.querySelectorAll('.dashboard-stats .stat-card-value');
        if (statValues[0]) statValues[0].textContent = String(pending.length);
        if (statValues[1]) statValues[1].textContent = String(pending.filter(function (u) { return u.role === 'customer'; }).length);
        if (statValues[2]) statValues[2].textContent = String(pending.filter(function (u) { return u.role === 'agency'; }).length);

        const customerTbody = document.querySelector('#customers tbody');
        const agencyTbody = document.querySelector('#agencies tbody');
        const customerRequests = pending.filter(function (u) { return u.role === 'customer'; });
        const agencyRequests = pending.filter(function (u) { return u.role === 'agency'; });

        function row(user, type) {
            if (type === 'agency') {
                return '<tr><td>' + user.id + '</td><td>' + esc(user.email) + '</td><td>' + esc(user.name) + '</td><td>Agency Administrator</td><td>Adventure City</td><td>' + fmtDate(user.createdAt) + '</td><td><span class="badge badge-warning">Pending</span></td><td><button type="button" class="btn btn-sm btn-view" data-view-user="' + user.id + '" data-view-type="agency"><i class="fas fa-eye"></i></button></td></tr>';
            }
            return '<tr><td>' + user.id + '</td><td>' + esc(user.email) + '</td><td>' + esc(user.name) + '</td><td>Adventure City</td><td>' + fmtDate(user.createdAt) + '</td><td><span class="badge badge-warning">Pending</span></td><td><button type="button" class="btn btn-sm btn-view" data-view-user="' + user.id + '" data-view-type="customer"><i class="fas fa-eye"></i></button></td></tr>';
        }

        if (customerTbody) customerTbody.innerHTML = customerRequests.length ? customerRequests.map(function (u) { return row(u, 'customer'); }).join('') : '<tr><td colspan="7"><div class="no-requests"><i class="fas fa-user-check"></i><p>No pending customer verification requests at this time.</p></div></td></tr>';
        if (agencyTbody) agencyTbody.innerHTML = agencyRequests.length ? agencyRequests.map(function (u) { return row(u, 'agency'); }).join('') : '<tr><td colspan="8"><div class="no-requests"><i class="fas fa-building"></i><p>No pending agency verification requests at this time.</p></div></td></tr>';

        document.querySelectorAll('[data-view-user]').forEach(function (button) {
            button.addEventListener('click', function () { openUserModal(Number(button.dataset.viewUser), button.dataset.viewType); });
        });
    }

    function openUserModal(id, type) {
        const modal = document.getElementById('userModal');
        const body = document.getElementById('modalBody');
        const title = document.getElementById('modalTitle');
        const footer = document.getElementById('modalFooter');
        const user = userForId(id);
        if (!modal || !body) return;
        if (!user) {
            body.innerHTML = '<div class="no-data-message"><i class="fas fa-user-times"></i><p>User not found.</p></div>';
            modal.classList.add('show');
            return;
        }
        title.textContent = (type === 'agency' ? 'Agency: ' : 'Customer: ') + user.name;
        body.innerHTML = type === 'agency' ?
            '<div class="modal-section"><h3><i class="fas fa-building"></i> Company Information</h3><p><strong>Company Name:</strong> ' + esc(user.name) + '</p><p><strong>Contact Person:</strong> Agency Administrator</p><p><strong>Contact Phone:</strong> +63 900 000 0000</p><p><strong>Email:</strong> ' + esc(user.email) + '</p><p><strong>Business Address:</strong> 123 Travel Street, Adventure City, AC 12345</p></div><div class="modal-section"><h3><i class="fas fa-file-contract"></i> Verification Documents</h3><div class="document-placeholder">Demo mode — no real documents are stored.</div></div>' :
            '<div class="modal-section"><h3><i class="fas fa-user"></i> Personal Information</h3><p><strong>Full Name:</strong> ' + esc(user.name) + '</p><p><strong>Email:</strong> ' + esc(user.email) + '</p><p><strong>Phone:</strong> +63 900 000 0000</p><p><strong>Date of Birth:</strong> N/A</p><p><strong>Address:</strong> 123 Travel Street, Adventure City</p></div><div class="modal-section"><h3><i class="fas fa-id-card"></i> License Documents</h3><div class="document-placeholder">Demo mode — no real documents are stored.</div></div>';
        footer.innerHTML = '<button type="button" class="btn btn-primary" data-approve-user><i class="fas fa-check"></i> Approve</button><button type="button" class="btn btn-delete" data-reject-user><i class="fas fa-times"></i> Reject</button><button type="button" class="btn btn-outline" data-close-modal>Close</button>';
        modal.classList.add('show');
        footer.querySelector('[data-approve-user]').addEventListener('click', function () { updateVerification(user.id, type, type === 'agency' ? 'approved' : 'verified'); });
        footer.querySelector('[data-reject-user]').addEventListener('click', function () { updateVerification(user.id, type, 'rejected'); });
        footer.querySelector('[data-close-modal]').addEventListener('click', closeUserModal);
    }

    function closeUserModal() {
        const modal = document.getElementById('userModal');
        if (modal) modal.classList.remove('show');
    }

    function updateVerification(id, type, status) {
        const overrides = getOverrides();
        overrides[id] = Object.assign({}, overrides[id], { verification: status });
        writeJSON(KEYS.overrides, overrides);
        closeUserModal();
        populateManageUsers();
    }

    function populateUserView() {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get('id') || 1003);
        const user = userForId(id);
        const container = document.querySelector('.user-details-container');
        if (!container) return;
        if (!user) {
            container.innerHTML = '<div class="no-data-message"><i class="fas fa-user-times"></i><h3>User not found</h3><p>The selected demo user does not exist.</p><a href="manage_users.html" class="btn btn-primary">Back to Users</a></div>';
            return;
        }
        const agency = user.role === 'agency';
        const bookings = getBookings().map(bookingNormalized).filter(function (b) { return b.customerEmail === user.email; });
        const vehicles = agency ? getVehicles().filter(function (v) { return String(v.agency).toLowerCase() === String(user.name).toLowerCase(); }) : [];
        const edit = document.querySelector('.main-content .action-buttons .btn-primary');
        if (edit) edit.href = 'admin_user_edit.html?id=' + user.id;
        container.innerHTML = '<div class="user-profile-card"><div class="profile-header"><div class="profile-image-placeholder"><img src="' + avatar + '" alt="Profile" class="profile-image"></div><div class="profile-title"><h2>' + esc(user.name) + '</h2><span class="user-type-badge badge-' + esc(user.role) + '">' + capitalize(user.role) + '</span></div></div><div class="profile-stats"><div class="stat-item"><div class="stat-value">' + bookings.length + '</div><div class="stat-label">Bookings</div></div><div class="stat-item"><div class="stat-value">' + vehicles.length + '</div><div class="stat-label">Vehicles</div></div><div class="stat-item"><div class="stat-value">' + fmtDate(user.createdAt) + '</div><div class="stat-label">Joined</div></div></div></div>' +
            '<div class="user-details-grid"><div class="details-section"><h3 class="section-title">Account Information</h3><div class="detail-item"><span class="detail-label">Email:</span><span class="detail-value">' + esc(user.email) + '</span></div><div class="detail-item"><span class="detail-label">Account Status:</span><span class="detail-value"><span class="status-badge ' + (user.active ? 'active' : 'inactive') + '">' + (user.active ? 'Active' : 'Inactive') + '</span></span></div><div class="detail-item"><span class="detail-label">Last Login:</span><span class="detail-value">Demo session</span></div><div class="detail-item"><span class="detail-label">Account Created:</span><span class="detail-value">' + fmtDateTime(user.createdAt) + '</span></div></div>' +
            '<div class="details-section"><h3 class="section-title">' + (agency ? 'Business Information' : 'Personal Information') + '</h3>' +
            (agency ? '<div class="detail-item"><span class="detail-label">Contact Person:</span><span class="detail-value">Agency Administrator</span></div><div class="detail-item"><span class="detail-label">Business Phone:</span><span class="detail-value">+63 900 000 0000</span></div><div class="detail-item"><span class="detail-label">Business Address:</span><span class="detail-value">123 Travel Street, Adventure City, AC 12345</span></div><div class="detail-item"><span class="detail-label">Business Type:</span><span class="detail-value">Car Rental Agency</span></div>' : '<div class="detail-item"><span class="detail-label">Phone:</span><span class="detail-value">+63 900 000 0000</span></div><div class="detail-item"><span class="detail-label">Date of Birth:</span><span class="detail-value">N/A</span></div><div class="detail-item"><span class="detail-label">Address:</span><span class="detail-value">123 Travel Street, Adventure City, AC 12345</span></div><div class="detail-item"><span class="detail-label">Driving License:</span><span class="detail-value">Demo account — N/A</span></div>') +
            '<div class="detail-item"><span class="detail-label">Verification Status:</span><span class="detail-value"><span class="status-badge ' + esc(user.verification) + '">' + capitalize(user.verification) + '</span></span></div></div></div>';
    }

    function populateUserEdit() {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get('id') || 1003);
        const user = userForId(id);
        const main = document.querySelector('.main-content');
        if (!main) return;
        if (!user) {
            main.innerHTML = '<div class="no-data-message"><i class="fas fa-user-times"></i><h3>User not found</h3><a href="manage_users.html" class="btn btn-primary">Back to Users</a></div>';
            return;
        }
        const statuses = user.role === 'agency' ? ['approved', 'pending', 'rejected'] : ['verified', 'pending', 'unverified', 'rejected'];
        main.innerHTML = '<div class="section-header"><div class="section-title">Edit User</div><div class="action-buttons"><a href="admin_user_view.html?id=' + user.id + '" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Back to View</a></div></div>' +
            '<form class="user-edit-form" id="adminEditUserForm"><div class="form-section"><h3 class="section-title">Account Status</h3><div class="form-group"><label class="checkbox-label"><input type="checkbox" name="is_active" ' + (user.active ? 'checked' : '') + '><span class="checkbox-custom"></span><span>Active Account</span></label><p class="form-help">Uncheck to deactivate this user\'s account</p></div></div>' +
            '<div class="form-section"><h3 class="section-title">Verification Status</h3><div class="form-group"><div class="radio-group">' + statuses.map(function (status) { return '<label class="radio-label"><input type="radio" name="verification_status" value="' + status + '" ' + (user.verification === status ? 'checked' : '') + '><span class="radio-custom"></span><span>' + capitalize(status) + '</span></label>'; }).join('') + '</div></div></div>' +
            '<div class="form-actions"><button class="btn btn-primary" type="submit"><i class="fas fa-save"></i> Save Changes</button><a class="btn btn-outline" href="admin_user_view.html?id=' + user.id + '">Cancel</a></div></form>';
        const form = document.getElementById('adminEditUserForm');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const overrides = getOverrides();
            const selected = form.querySelector('input[name="verification_status"]:checked');
            overrides[user.id] = Object.assign({}, overrides[user.id], { active: form.is_active.checked, verification: selected ? selected.value : user.verification });
            writeJSON(KEYS.overrides, overrides);
            window.location.href = 'admin_user_view.html?id=' + user.id;
        });
    }

    function buildVehicleFeatures(vehicle) {
        const features = ['Air Conditioning', 'Bluetooth', 'USB Charging', vehicle.seats + ' Seats'];
        return features.map(function (feature) { return '<span class="feature-tag"><i class="fas fa-check"></i> ' + esc(feature) + '</span>'; }).join('');
    }

    function populateViewBooking() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || params.get('booking_id');
        const bookings = getBookings().map(bookingNormalized);
        const booking = id ? bookings.find(function (b) { return String(b.bookingId) === String(id); }) : null;
        const main = document.querySelector('.main-content');
        if (!main) return;
        if (!booking) {
            main.innerHTML = '<div class="section-header"><div><h1 class="section-title">Booking Details</h1><p class="section-description">View the complete information about this booking</p></div></div><div class="no-data-message"><i class="fas fa-calendar-times"></i><h3>Booking not found</h3><p>Select a booking from Manage Bookings to view its details.</p><a href="admin_bookings.html" class="btn btn-primary">Back to Bookings</a></div>';
            return;
        }
        const vehicle = getVehicles().find(function (v) { return Number(v.id) === Number(booking.vehicleId); }) || getVehicles()[0];
        main.innerHTML = '<div class="section-header"><div><h1 class="section-title">Booking Details</h1><p class="section-description">View the complete information about this booking</p></div></div>' +
            '<div class="booking-details-container"><div class="booking-header"><div><h2>Booking #' + esc(booking.bookingId) + '</h2><p class="text-muted">Booked on ' + fmtDateTime(booking.bookingDate) + '</p></div><div class="status-badge status-' + esc(booking.status) + '"><i class="fas fa-calendar-check"></i> ' + capitalize(booking.status) + '</div></div>' +
            '<div class="vehicle-details"><div class="car-gallery"><div class="gallery-main"><img id="mainImage" src="' + carImage + '" alt="' + esc(booking.vehicleName) + '"><div class="gallery-nav gallery-prev" onclick="changeGalleryImage(-1)"><i class="fas fa-chevron-left"></i></div><div class="gallery-nav gallery-next" onclick="changeGalleryImage(1)"><i class="fas fa-chevron-right"></i></div><div class="image-counter"><span id="currentImageIndex">1</span> / <span id="totalImages">1</span></div></div><div class="gallery-thumbnails"><div class="gallery-thumbnail active" data-index="0" onclick="changeImage(0, this)"><img src="' + carImage + '" alt="Vehicle view"></div></div></div>' +
            '<div class="vehicle-info"><h2 class="car-title">' + esc(booking.vehicleName) + ' ' + esc(vehicle.year || '') + '</h2><div class="car-description-box"><h3>About this vehicle</h3><p>' + esc(vehicle.description || 'Demo vehicle available for rental.') + '</p></div><div class="vehicle-specs">' +
            '<div class="spec-item"><div class="spec-icon"><i class="fas fa-door-closed"></i></div><div class="spec-details"><div class="spec-value">' + (vehicle.doors || 4) + ' Doors</div></div></div>' +
            '<div class="spec-item"><div class="spec-icon"><i class="fas fa-cog"></i></div><div class="spec-details"><div class="spec-value">' + esc(vehicle.transmission || 'Automatic') + '</div></div></div>' +
            '<div class="spec-item"><div class="spec-icon"><i class="fas fa-gas-pump"></i></div><div class="spec-details"><div class="spec-value">' + esc(vehicle.fuel || 'Gasoline') + '</div></div></div>' +
            '<div class="spec-item"><div class="spec-icon"><i class="fas fa-users"></i></div><div class="spec-details"><div class="spec-value">' + (vehicle.seats || 5) + ' Seats</div></div></div>' +
            '<div class="spec-item"><div class="spec-icon"><i class="fas fa-tachometer-alt"></i></div><div class="spec-details"><div class="spec-value">' + esc(vehicle.mileage || 'Unlimited') + ' km</div></div></div>' +
            '<div class="spec-item"><div class="spec-icon"><i class="fas fa-car"></i></div><div class="spec-details"><div class="spec-value">' + esc(booking.vehicleType) + '</div></div></div></div>' +
            '<div class="car-description-box"><h3>Car Features</h3><div class="features-list">' + buildVehicleFeatures(vehicle) + '</div></div></div></div>' +
            '<div class="rental-details"><h3>Rental Information</h3><div class="info-group"><div class="info-item"><span class="info-label">Pickup Date</span><span class="info-value">' + fmtDate(booking.pickupDate) + '</span></div><div class="info-item"><span class="info-label">Return Date</span><span class="info-value">' + fmtDate(booking.returnDate) + '</span></div><div class="info-item"><span class="info-label">Duration</span><span class="info-value">' + booking.days + ' days</span></div><div class="info-item"><span class="info-label">Total Amount</span><span class="info-value">' + fmtMoney(booking.totalAmount) + '</span></div></div></div>' +
            '<div class="customer-info"><h3>Customer Information</h3><div class="info-group"><div class="info-item"><span class="info-label">Name</span><span class="info-value"><img src="' + avatar + '" alt="Customer" class="customer-avatar"> ' + esc(booking.customerName) + '</span></div><div class="info-item"><span class="info-label">Email</span><span class="info-value">' + esc(booking.customerEmail) + '</span></div><div class="info-item"><span class="info-label">Phone</span><span class="info-value">' + esc(booking.customerPhone) + '</span></div></div></div>' +
            '<div class="agency-info"><div class="agency-header"><img src="' + avatar + '" alt="Agency" class="agency-logo"><div><h3>' + esc(booking.agencyName) + '</h3><p>Verified partner agency</p></div></div><p><i class="fas fa-map-marker-alt"></i> 123 Travel Street, Adventure City, AC 12345</p></div>' +
            '<div class="payment-info"><h3>Payment Information</h3><div class="info-group"><div class="info-item"><span class="info-label">Status</span><span class="info-value">' + capitalize(booking.paymentStatus) + '</span></div><div class="info-item"><span class="info-label">Method</span><span class="info-value">' + esc(booking.paymentMethod) + '</span></div><div class="info-item"><span class="info-label">Transaction ID</span><span class="info-value">' + esc(booking.transactionId || 'N/A') + '</span></div></div></div>' +
            '<div class="status-timeline"><h3>Booking Timeline</h3><div class="timeline-item"><div class="timeline-content"><div class="timeline-date">' + fmtDateTime(booking.bookingDate) + '</div><h4>Booking Created</h4><p>Demo booking was submitted by the customer.</p></div></div></div>' +
            '<div class="admin-actions"><button class="btn-admin btn-confirm" onclick="updateBookingStatus(\'' + esc(booking.bookingId) + '\',\'confirmed\')"><i class="fas fa-check-circle"></i> Confirm Booking</button><button class="btn-admin btn-complete" onclick="updateBookingStatus(\'' + esc(booking.bookingId) + '\',\'completed\')"><i class="fas fa-flag-checkered"></i> Mark as Completed</button><button class="btn-admin btn-cancel" onclick="updateBookingStatus(\'' + esc(booking.bookingId) + '\',\'cancelled\')"><i class="fas fa-times-circle"></i> Cancel Booking</button><a class="btn btn-outline" href="admin_bookings.html"><i class="fas fa-arrow-left"></i> Back to Bookings</a></div></div>';
    }

    window.updateBookingStatus = function (idOrStatus, maybeStatus) {
        const params = new URLSearchParams(window.location.search);
        const id = maybeStatus ? idOrStatus : (params.get('id') || params.get('booking_id'));
        const status = maybeStatus || idOrStatus;
        if (!id || !status) return;
        const raw = getBookings();
        const index = raw.findIndex(function (b, i) { return String((b.bookingId || ('DEMO-' + String(i + 1).padStart(4, '0')))) === String(id); });
        if (index < 0) return;
        raw[index].status = status;
        writeJSON(KEYS.bookings, raw);
        if (document.body) {
            const badge = document.querySelector('.booking-details-container .booking-header .status-badge');
            if (badge) { badge.className = 'status-badge status-' + status; badge.innerHTML = '<i class="fas fa-calendar-check"></i> ' + capitalize(status); }
        }
    };

    let galleryImages = [carImage];
    let galleryIndex = 0;

    window.changeMainImage = function (src, element) {
        const main = document.getElementById('mainCarImage') || document.getElementById('mainImage');
        if (main) main.src = src || carImage;
        document.querySelectorAll('.thumbnail, .gallery-thumbnail').forEach(function (item) { item.classList.remove('active'); });
        if (element) element.classList.add('active');
    };

    window.changeImage = function (index, element) {
        galleryIndex = Number(index) || 0;
        window.changeMainImage(galleryImages[galleryIndex] || carImage, element);
        const current = document.getElementById('currentImageIndex'); if (current) current.textContent = String(galleryIndex + 1);
    };

    window.changeGalleryImage = function (direction) {
        galleryIndex = (galleryIndex + Number(direction) + galleryImages.length) % galleryImages.length;
        window.changeImage(galleryIndex, document.querySelector('.gallery-thumbnail[data-index="' + galleryIndex + '"]'));
    };

    window.openGalleryLightbox = function () {
        const lightbox = document.getElementById('galleryLightbox');
        if (!lightbox) return;
        const image = document.getElementById('lightboxImage');
        if (image) image.src = galleryImages[galleryIndex] || carImage;
        const current = document.getElementById('lightboxCurrentImage'); if (current) current.textContent = String(galleryIndex + 1);
        const total = document.getElementById('lightboxTotalImages'); if (total) total.textContent = String(galleryImages.length);
        lightbox.classList.add('active');
    };

    window.closeLightbox = function () {
        const lightbox = document.getElementById('galleryLightbox');
        if (lightbox) lightbox.classList.remove('active');
    };

    window.changeLightboxImage = function (direction) {
        galleryIndex = (galleryIndex + Number(direction) + galleryImages.length) % galleryImages.length;
        const image = document.getElementById('lightboxImage'); if (image) image.src = galleryImages[galleryIndex] || carImage;
        const current = document.getElementById('lightboxCurrentImage'); if (current) current.textContent = String(galleryIndex + 1);
    };

    function populateViewVehicle() {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get('id') || 1);
        const vehicles = getVehicles();
        const vehicle = vehicles.find(function (v) { return Number(v.id) === id; }) || vehicles[0];
        const main = document.querySelector('.car-details');
        if (!main || !vehicle) return;
        galleryImages = [carImage]; galleryIndex = 0;
        const title = main.querySelector('.car-title'); if (title) title.textContent = vehicle.make + ' ' + vehicle.model + ' ' + vehicle.year;
        const subtitle = main.querySelector('.section-description'); if (subtitle) subtitle.textContent = 'Viewing details for ' + vehicle.make + ' ' + vehicle.model;
        const mainImage = main.querySelector('#mainCarImage'); if (mainImage) { mainImage.src = carImage; mainImage.alt = vehicle.make + ' ' + vehicle.model; }
        const thumbGrid = main.querySelector('.thumbnail-grid');
        if (thumbGrid) thumbGrid.innerHTML = '<div class="thumbnail active" data-index="0" onclick="changeMainImage(\'' + carImage + '\', this)"><img src="' + carImage + '" alt="' + esc(vehicle.make + ' ' + vehicle.model) + ' view 1"></div>' + ['1','2','3','4'].map(function () { return '<div class="thumbnail empty"><img src="' + carImage + '" alt="Vehicle demo image"></div>'; }).join('');
        const current = main.querySelector('#currentImageIndex'); if (current) current.textContent = '1';
        const total = main.querySelector('#totalImages'); if (total) total.textContent = '1';
        const typeBadge = main.querySelector('.car-type'); if (typeBadge) typeBadge.textContent = vehicle.type;
        const agencyName = main.querySelector('.agency-name'); if (agencyName) agencyName.textContent = vehicle.agency;
        main.querySelectorAll('.agency-meta span').forEach(function (item, index) { item.innerHTML = index === 0 ? '<i class="fas fa-clock"></i><span>Member since September 2026</span>' : '<i class="fas fa-phone"></i><span>+63 900 000 0000</span>'; });
        const price = main.querySelector('.car-price'); if (price) price.innerHTML = fmtMoney(vehicle.price) + ' <span class="price-period">/ day</span>';
        const meta = main.querySelectorAll('.car-meta .meta-item span'); if (meta[0]) meta[0].textContent = vehicle.location || 'Adventure City'; if (meta[1]) meta[1].textContent = 'Added ' + fmtDate(vehicle.addedDate);
        const desc = main.querySelector('#descriptionTabContent .car-description-box p'); if (desc) desc.textContent = vehicle.description;
        const specs = main.querySelectorAll('#specsTabContent .spec-item span');
        if (specs[0]) specs[0].textContent = vehicle.seats + ' Seats'; if (specs[1]) specs[1].textContent = (vehicle.luggage || 2) + ' Luggage'; if (specs[2]) specs[2].textContent = vehicle.transmission; if (specs[3]) specs[3].textContent = vehicle.fuel; if (specs[4]) specs[4].textContent = vehicle.mileage + ' km'; if (specs[5]) specs[5].textContent = vehicle.year;
        const features = main.querySelector('#featuresTabContent .features-list'); if (features) features.innerHTML = buildVehicleFeatures(vehicle);
        const del = main.querySelector('.admin-actions .btn-danger');
        if (del) { del.onclick = function (event) { event.preventDefault(); if (!window.confirm('Delete this vehicle from the demo fleet?')) return; writeJSON(KEYS.vehicles, getVehicles().filter(function (v) { return Number(v.id) !== Number(vehicle.id); })); window.location.href = 'admin_vehicles.html'; }; del.href = '#'; }
        const vehicleBookings = getBookings().map(bookingNormalized).filter(function (b) { return Number(b.vehicleId) === Number(vehicle.id); });
        const statValues = main.querySelectorAll('.booking-history .stat-value');
        const revenue = vehicleBookings.reduce(function (sum, b) { return sum + Number(b.totalAmount || 0); }, 0);
        if (statValues[0]) statValues[0].textContent = String(vehicleBookings.length);
        if (statValues[1]) statValues[1].textContent = String(vehicleBookings.filter(function (b) { return b.status === 'completed'; }).length);
        if (statValues[2]) statValues[2].textContent = String(vehicleBookings.filter(function (b) { return b.status === 'pending' || b.status === 'confirmed'; }).length);
        if (statValues[3]) statValues[3].textContent = fmtMoney(revenue);
        const recent = main.querySelector('.bookings-table tbody'); const noBookings = main.querySelector('.no-bookings'); const wrapper = main.querySelector('.bookings-table-wrapper');
        if (vehicleBookings.length && recent) {
            if (noBookings) noBookings.style.display = 'none'; if (wrapper) wrapper.style.display = 'block';
            recent.innerHTML = vehicleBookings.slice().sort(function (a,b){return new Date(b.bookingDate)-new Date(a.bookingDate);}).slice(0,5).map(function (b) { return '<tr><td>#' + esc(b.bookingId) + '</td><td class="customer-info-cell"><img src="' + avatar + '" alt="Customer" class="customer-avatar-small"><span>' + esc(b.customerName) + '</span></td><td><div class="booking-dates"><div><span class="date-label">From:</span> ' + fmtDate(b.pickupDate) + '</div><div><span class="date-label">To:</span> ' + fmtDate(b.returnDate) + '</div></div></td><td><span class="status-badge status-' + esc(b.status) + '">' + capitalize(b.status) + '</span></td><td><span class="payment-badge payment-' + esc(b.paymentStatus) + '">' + capitalize(b.paymentStatus) + '</span></td><td>' + fmtMoney(b.totalAmount) + '</td><td><a class="btn-view-small" href="view_booking.html?id=' + encodeURIComponent(b.bookingId) + '"><i class="fas fa-eye"></i></a></td></tr>'; }).join('');
        } else {
            if (noBookings) noBookings.style.display = 'block'; if (wrapper) wrapper.style.display = 'none';
        }
    }

    function populateReports() {
        const complaints = getComplaints();
        const counts = { pending: 0, in_progress: 0, resolved: 0 };
        complaints.forEach(function (c) { if (counts[c.status] != null) counts[c.status] += 1; });
        const cards = document.querySelectorAll('.stats-cards .stat-value');
        if (cards[0]) cards[0].textContent = String(counts.pending);
        if (cards[1]) cards[1].textContent = String(counts.in_progress);
        if (cards[2]) cards[2].textContent = String(counts.resolved);
        if (cards[3]) cards[3].textContent = String(complaints.length);
        const container = document.querySelector('.reports-container');
        if (!container) return;

        function render() {
            const term = (document.getElementById('searchInput') && document.getElementById('searchInput').value || '').trim().toLowerCase();
            const status = document.getElementById('statusFilter') && document.getElementById('statusFilter').value || 'all';
            const type = document.getElementById('userTypeFilter') && document.getElementById('userTypeFilter').value || 'all';
            let list = getComplaints();
            list = list.filter(function (c) { return (status === 'all' || c.status === status) && (type === 'all' || c.userType === type) && (!term || JSON.stringify(c).toLowerCase().includes(term)); });
            container.innerHTML = list.length ? list.map(function (c, index) {
                const prettyStatus = capitalize(c.status || 'pending');
                return '<div class="complaint-card"><div class="complaint-header"><div class="user-info"><img src="' + avatar + '" alt="User" class="user-avatar"><div><div class="complaint-subject">' + esc(c.subject || 'Support Request') + '</div><div class="complaint-meta"><span>' + esc(c.userName || 'User') + '</span> • <span>' + esc(c.email || '') + '</span> • <span>' + capitalize(c.userType || 'agency') + '</span> • <span>' + fmtDate(c.createdAt || new Date()) + '</span></div></div></div><span class="status-badge status-' + esc(c.status || 'pending') + '">' + prettyStatus + '</span></div><div class="complaint-message">' + esc(c.message || '') + '</div><div class="complaint-actions"><select class="form-control report-status" data-index="' + index + '"><option value="pending" ' + (c.status === 'pending' ? 'selected' : '') + '>Pending</option><option value="in_progress" ' + (c.status === 'in_progress' ? 'selected' : '') + '>In Progress</option><option value="resolved" ' + (c.status === 'resolved' ? 'selected' : '') + '>Resolved</option></select><button type="button" class="btn btn-primary report-save" data-index="' + index + '"><i class="fas fa-save"></i> Update</button><button type="button" class="btn btn-outline report-user" data-index="' + index + '"><i class="fas fa-user"></i> View User</button></div></div>';
            }).join('') : '<div class="no-data-message"><i class="fas fa-flag" style="font-size:48px"></i><h3>No complaints found</h3><p>There are currently no user complaints to display.</p></div>';
            container.querySelectorAll('.report-save').forEach(function (button) {
                button.addEventListener('click', function () {
                    const filteredIndex = Number(button.dataset.index);
                    const visible = list[filteredIndex];
                    const stored = getComplaints();
                    const realIndex = stored.findIndex(function (item) { return item.createdAt === visible.createdAt && item.email === visible.email && item.subject === visible.subject; });
                    const select = container.querySelector('.report-status[data-index="' + filteredIndex + '"]');
                    if (realIndex >= 0 && select) { stored[realIndex].status = select.value; stored[realIndex].resolvedAt = select.value === 'resolved' ? new Date().toISOString() : null; writeJSON(KEYS.complaints, stored); populateReports(); }
                });
            });
            container.querySelectorAll('.report-user').forEach(function (button) {
                button.addEventListener('click', function () {
                    const item = list[Number(button.dataset.index)];
                    const modal = document.getElementById('userModal'); const body = document.getElementById('userModalBody');
                    if (!modal || !body) return;
                    body.innerHTML = '<div class="modal-section"><h4>' + esc(item.userName || 'User') + '</h4><p><strong>Email:</strong> ' + esc(item.email || '') + '</p><p><strong>Type:</strong> ' + capitalize(item.userType || 'agency') + '</p><p><strong>Subject:</strong> ' + esc(item.subject || 'Support Request') + '</p><p><strong>Message:</strong> ' + esc(item.message || '') + '</p></div>';
                    modal.style.display = 'flex';
                });
            });
        }
        ['searchInput', 'statusFilter', 'userTypeFilter'].forEach(function (id) { const el = document.getElementById(id); if (el) el.addEventListener('input', render); });
        render();
        window.exportToCSV = function () {
            const rows = [['Subject', 'User', 'Email', 'Type', 'Status', 'Message', 'Created At']].concat(getComplaints().map(function (c) { return [c.subject || '', c.userName || '', c.email || '', c.userType || '', c.status || '', c.message || '', c.createdAt || '']; }));
            const csv = rows.map(function (row) { return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
            const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'tourgo-complaints.csv'; link.click(); URL.revokeObjectURL(link.href);
        };
    }

    function closeReportsModal() {
        const modal = document.getElementById('userModal');
        if (modal) modal.style.display = 'none';
    }

    window.closeModal = closeReportsModal;

    function route() {
        initCommon();
        const file = window.location.pathname.split('/').pop();
        if (file === 'admin_dashboard.html') populateDashboard();
        else if (file === 'admin_vehicles.html') populateVehicles();
        else if (file === 'admin_bookings.html') populateBookings();
        else if (file === 'manage_users.html') populateManageUsers();
        else if (file === 'admin_user_view.html') populateUserView();
        else if (file === 'admin_user_edit.html') populateUserEdit();
        else if (file === 'view_booking.html') populateViewBooking();
        else if (file === 'view_vehicle.html') populateViewVehicle();
        else if (file === 'reports.html') populateReports();
        const reportsModal = document.getElementById('userModal');
        if (reportsModal && file === 'reports.html') {
            reportsModal.addEventListener('click', function (event) { if (event.target === reportsModal) closeReportsModal(); });
            const close = reportsModal.querySelector('.close-modal'); if (close) close.addEventListener('click', closeReportsModal);
        }
        if (file === 'admin_dashboard.html') document.addEventListener('tourgo:charts-refresh', function () { populateDashboard(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route); else route();
})(window, document);
