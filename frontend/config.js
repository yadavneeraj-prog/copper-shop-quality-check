/* ============================================================
   Shared config, auth storage, and API helper - loaded by every page.
   Point API_BASE at wherever you host the backend from /backend.
   ============================================================ */
const API_BASE = 'https://copper-shop-backend.onrender.com';

/* ---- auth token/user, persisted across pages via localStorage ----
   (This is a real, self-hosted app - not an in-chat preview - so
   localStorage is the right place for this. For extra security in
   production you could switch the backend to issue an httpOnly
   cookie instead and drop this. ) */
function saveAuth(token, user) {
  localStorage.setItem('csqc_token', token);
  localStorage.setItem('csqc_user', JSON.stringify(user));
}
function getToken() { return localStorage.getItem('csqc_token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('csqc_user') || 'null'); }
  catch (e) { return null; }
}
function clearAuth() {
  localStorage.removeItem('csqc_token');
  localStorage.removeItem('csqc_user');
}

// Call at the top of any page that requires login.
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

/* ---- fetch wrapper: adds the auth header, throws on non-2xx ---- */
async function api(path, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (res.status === 401) {
    clearAuth();
    window.location.href = 'login.html';
    throw new Error('Session expired.');
  }
  if (!res.ok) throw new Error((data && data.message) || 'Request failed.');
  return data;
}

/* ---- small shared helpers ---- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function buildShareUrl(linkId) {
  // opening this URL takes you straight to that part code's photo page
  return window.location.origin + window.location.pathname.replace(/dashboard\.html$/, '') + 'dashboard.html?link=' + linkId;
}
function toggleEye(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = 'hide'; }
  else { inp.type = 'password'; btn.textContent = 'show'; }
}
function showMsg(id, text) { const el = document.getElementById(id); el.textContent = text; el.style.display = 'block'; }
function hideMsg(id) { document.getElementById(id).style.display = 'none'; }
