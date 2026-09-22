const API_BASE = 'https://api.palembangpy.org/v1';
const STORAGE_KEY = 'palembangpy_token';

// ==============================================
// DATA DUMMY
// ==============================================
let DATA = {
  events: [
    { id: 1, name: 'PalembangPy Meetup #1', date: '2026-10-15', location: 'Cafe Kawan Lama', status: 'Akan Datang', description: 'Belajar Dasar Python untuk Pemula', quota: 50 },
    { id: 2, name: 'Workshop Web Python', date: '2026-09-28', location: 'Kampus UIN Raden Fatah', status: 'Berlangsung', description: 'Praktikum Flask & FastAPI', quota: 30 },
    { id: 3, name: 'Hackathon Palembang 2026', date: '2026-11-01', location: 'Digital Hub Palembang', status: 'Akan Datang', description: 'Kompetisi Coding 24 Jam', quota: 100 }
  ],
  users: [
    { id: 1, name: 'Budi Santoso', telegram_id: '@budi_py', event_id: 1, checked_in_at: '2026-09-22T10:30:00' },
    { id: 2, name: 'Siti Aisyah', telegram_id: '@siti_dev', event_id: 1, checked_in_at: null },
    { id: 3, name: 'Ahmad Rizki', telegram_id: '@ahmadcode', event_id: 2, checked_in_at: '2026-09-22T09:15:00' },
    { id: 4, name: 'Dewi Lestari', telegram_id: '@dewi_py', event_id: 2, checked_in_at: null }
  ],
  partners: [
    { id: 1, name: 'PT Tech Nusantara', contact_person: 'Budi Wijaya', email: 'budi@technusantara.com', phone: '08123456789' },
    { id: 2, name: 'Cafe Kawan Lama', contact_person: 'Sari Melati', email: 'sari@kawanlama.com', phone: '08234567890' }
  ],
  speakers: [
    { id: 1, name: 'Dr. Andi Wijaya', topic: 'Masa Depan AI & Python', organization: 'Universitas Teknologi Indonesia' },
    { id: 2, name: 'Rina Marlina', topic: 'Python untuk Analisis Data', organization: 'Data Community Palembang' }
  ]
};

// ==============================================
// AUTH
// ==============================================
function getToken() { return localStorage.getItem(STORAGE_KEY); }

async function checkAuth() {
  if (!getToken()) {
    if (!window.location.pathname.includes('login.html')) window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = 'login.html';
}

// ==============================================
// CRUD
// ==============================================
async function getEvents() { return [...DATA.events]; }
async function getUsers() { return [...DATA.users]; }
async function getPartners() { return [...DATA.partners]; }
async function getSpeakers() { return [...DATA.speakers]; }

function addEvent(data) { DATA.events.unshift({ id: Date.now(), ...data, status: data.status || 'Akan Datang' }); }
function updateEvent(id, data) { const i = DATA.events.findIndex(e => e.id === id); if (i !== -1) DATA.events[i] = { ...DATA.events[i], ...data }; }
function deleteEvent(id) { DATA.events = DATA.events.filter(e => e.id !== id); DATA.users = DATA.users.filter(u => u.event_id !== id); }

function addPartner(data) { DATA.partners.unshift({ id: Date.now(), ...data }); }
function updatePartner(id, data) { const i = DATA.partners.findIndex(p => p.id === id); if (i !== -1) DATA.partners[i] = { ...DATA.partners[i], ...data }; }
function deletePartner(id) { DATA.partners = DATA.partners.filter(p => p.id !== id); }

function addSpeaker(data) { DATA.speakers.unshift({ id: Date.now(), ...data }); }
function updateSpeaker(id, data) { const i = DATA.speakers.findIndex(s => s.id === id); if (i !== -1) DATA.speakers[i] = { ...DATA.speakers[i], ...data }; }
function deleteSpeaker(id) { DATA.speakers = DATA.speakers.filter(s => s.id !== id); }

// ==============================================
// LAYOUT MODERN & COMPACT
// ==============================================
function renderLayout(activeMenu, content) {
  const menuItems = [
    { id: 'dashboard', href: 'index.html', icon: 'fa-home', label: 'Dashboard' },
    { id: 'events', href: 'events.html', icon: 'fa-calendar-alt', label: 'Event' },
    { id: 'users', href: 'users.html', icon: 'fa-users', label: 'Peserta' },
    { id: 'partners', href: 'partners.html', icon: 'fa-handshake-o', label: 'Mitra' },
    { id: 'speakers', href: 'speakers.html', icon: 'fa-microphone', label: 'Pembicara' }
  ];

  return `
    <div class="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <!-- Sidebar -->
      <aside id="sidebar" class="w-64 bg-white/95 backdrop-blur-xl shadow-xl border-r border-slate-100 transition-all duration-300 fixed md:static inset-y-0 left-0 z-40 -translate-x-full md:translate-x-0 flex flex-col">
        <!-- Brand -->
        <div class="p-4 md:p-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <i class="fa fa-code text-white"></i>
            </div>
            <div>
              <h1 class="font-bold text-slate-800 text-base">PalembangPy</h1>
              <p class="text-[10px] text-slate-400">Admin Dashboard</p>
            </div>
          </div>
        </div>
        
        <!-- Menu -->
        <nav class="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
          ${menuItems.map(m => `
            <a href="${m.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${activeMenu === m.id ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}">
              <i class="fa ${m.icon} w-4 text-center ${activeMenu === m.id ? '' : 'group-hover:scale-110 transition-transform'}"></i>
              <span class="font-medium">${m.label}</span>
            </a>
          `).join('')}
          
          <button onclick="logout()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-50 w-full text-left mt-4 transition-all">
            <i class="fa fa-sign-out w-4 text-center"></i>
            <span class="font-medium">Keluar</span>
          </button>
        </nav>
        
        <!-- Footer -->
        <div class="p-4 border-t border-slate-100 hidden md:block">
          <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-3">
            <p class="text-xs font-medium text-slate-700">PalembangPy v1.0</p>
            <p class="text-[10px] text-slate-500 mt-0.5">© 2026 Python Community</p>
          </div>
        </div>
      </aside>

      <!-- Overlay Mobile -->
      <div id="overlay" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 hidden md:hidden" onclick="toggleSidebar()"></div>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-h-screen">
        <!-- Topbar -->
        <header class="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100 px-3 md:px-6 py-2.5 md:py-3 flex items-center justify-between sticky top-0 z-20">
          <button id="menuToggle" class="md:hidden text-slate-600 hover:text-indigo-600 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition">
            <i class="fa fa-bars"></i>
          </button>
          <div class="ml-auto flex items-center gap-2 md:gap-4">
            <button class="relative p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition">
              <i class="fa fa-bell"></i>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div class="flex items-center gap-2 pl-2 md:pl-3 border-l border-slate-200">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">A</div>
              <div class="hidden sm:block">
                <p class="text-xs font-semibold text-slate-700 leading-tight">Admin</p>
                <p class="text-[10px] text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Content Area -->
        <div class="flex-1 p-3 md:p-6 lg:p-8">
          ${content}
        </div>
      </main>
    </div>
  `;
}

// ==============================================
// FUNGSI GLOBAL
// ==============================================
function initLayoutEvents() {
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
  document.getElementById('overlay')?.classList.toggle('hidden');
}

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); document.body.style.overflow = ''; }

// Tutup modal dengan klik luar
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.add('hidden');
    document.body.style.overflow = '';
  }
});
