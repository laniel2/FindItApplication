/**
 * A tiny "database" that lives in the browser's localStorage.
 * It answers the same requests the old server did (register, login, items CRUD...),
 * so the rest of the app doesn't care where the data is stored.
 *
 * Keys in localStorage:
 *   findit.db.users   all accounts
 *   findit.db.items   all lost & found posts
 *   findit.token      who is logged in
 *
 * Note: this is a learning project. Data stays in THIS browser only,
 * and passwords are only lightly protected. Don't reuse a real password.
 */
import { CATEGORIES } from '../utils/constants';

const USERS = 'findit.db.users';
const ITEMS = 'findit.db.items';
const TOKEN = 'findit.token';

/* ---------- storage helpers ---------- */
function httpError(status, message, errors) {
  const err = new Error(message);
  err.status = status;
  err.errors = errors;
  return err;
}

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
};

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw httpError(507, 'Browser storage is full. Use a smaller photo or delete some old posts.');
  }
}

const nextId = (rows) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
const now = () => new Date().toISOString();

async function hash(text) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; // fallback when the page isn't a "secure context"
  for (const c of text) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return `weak${h.toString(16)}`;
}

const isGmail = (v) => /^[^\s@]+@gmail\.com$/i.test(String(v || '').trim());

const publicUser = (u) => ({
  id: u.id, name: u.name, student_id: u.student_id, email: u.email,
  course: u.course, year_level: u.year_level, avatar: u.avatar, created_at: u.created_at,
  role: u.role || 'student',
});

function makeSession(user) {
  return { token: `local.${user.id}.${Math.random().toString(36).slice(2)}`, user: publicUser(user) };
}

function currentUser() {
  let token = null;
  try { token = JSON.parse(localStorage.getItem(TOKEN)); } catch { /* ignore */ }
  const id = Number(/^local\.(\d+)\./.exec(token || '')?.[1]);
  const user = id ? read(USERS).find((u) => u.id === id) : null;
  if (!user) throw httpError(401, 'Please log in to continue');
  return user;
}

// An item plus the poster's details (like a SQL JOIN).
function withPoster(item, users = read(USERS)) {
  const u = users.find((x) => x.id === item.user_id);
  return {
    ...item,
    poster_name: u?.name || 'Unknown student',
    poster_email: u?.email || '',
    poster_student_id: u?.student_id || '',
    poster_course: u?.course || '',
  };
}

function validateItem(b = {}) {
  const errors = {};
  if (!['lost', 'found'].includes(b.type)) errors.type = 'Choose lost or found';
  if (!b.title?.trim()) errors.title = 'Give the item a short title';
  else if (b.title.length > 120) errors.title = 'Keep the title under 120 characters';
  if (!CATEGORIES.includes(b.category)) errors.category = 'Pick a category';
  if (!b.location?.trim()) errors.location = 'Tell us where it was lost or found';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date_event || '')) errors.date_event = 'Choose a date';
  return errors;
}

function failIfInvalid(errors) {
  if (Object.keys(errors).length) throw httpError(422, 'Please fix the highlighted fields', errors);
}

/* ---------- auth ---------- */
async function register({ body = {} }) {
  const { name, student_id, email, password } = body;
  const errors = {};
  if (!name?.trim()) errors.name = 'Enter your full name';
  if (!student_id?.trim()) errors.student_id = 'Enter your student ID';
  if (!isGmail(email)) errors.email = 'Use your Gmail address (name@gmail.com)';
  if ((password || '').length < 6) errors.password = 'Use at least 6 characters';
  failIfInvalid(errors);

  const users = read(USERS);
  const mail = email.trim().toLowerCase();
  if (users.some((u) => u.email === mail || u.student_id === student_id.trim())) {
    throw httpError(409, 'An account with that email or student ID already exists');
  }
  const user = {
    id: nextId(users), name: name.trim(), student_id: student_id.trim(), email: mail,
    password_hash: await hash(`${mail}:${password}`),
    course: '', year_level: '', avatar: '', created_at: now(),
  };
  write(USERS, [...users, user]);
  return makeSession(user);
}

async function login({ body = {} }) {
  await ensureDemoAccounts();
  const mail = String(body.email || '').trim().toLowerCase();
  const user = read(USERS).find((u) => u.email === mail);
  if (!user || user.password_hash !== (await hash(`${mail}:${body.password || ''}`))) {
    throw httpError(401, 'Wrong email or password');
  }
  return makeSession(user);
}

// This app stores everything in this browser. These demo credentials are for
// local classroom use only; a real deployment needs server-side account roles.
let demoAccountsReady;
function ensureDemoAccounts() {
  if (!demoAccountsReady) demoAccountsReady = (async () => {
    const users = read(USERS);
    const demos = [
      { name: 'FindIt Admin', student_id: 'ADMIN-001', email: 'admin@gmail.com', password: 'FindItAdmin123', role: 'admin' },
      { name: 'Demo Student', student_id: 'STUDENT-001', email: 'student@gmail.com', password: 'FindItStudent123', role: 'student' },
    ];
    let next = [...users];
    for (const demo of demos) {
      const mail = demo.email;
      if (next.some((u) => u.email === mail)) continue;
      next.push({ id: nextId(next), name: demo.name, student_id: demo.student_id, email: mail,
        password_hash: await hash(`${mail}:${demo.password}`), course: '', year_level: '', avatar: '',
        role: demo.role, created_at: now() });
    }
    if (next.length !== users.length) write(USERS, next);
  })();
  return demoAccountsReady;
}

const me = () => ({ user: publicUser(currentUser()) });

/* ---------- profile ---------- */
function updateProfile({ body = {} }) {
  const user = currentUser();
  const { name, student_id, course = '', year_level = '', avatar = '' } = body;
  const errors = {};
  if (!name?.trim()) errors.name = 'Enter your full name';
  if (!student_id?.trim()) errors.student_id = 'Enter your student ID';
  failIfInvalid(errors);

  const users = read(USERS);
  if (users.some((u) => u.student_id === student_id.trim() && u.id !== user.id)) {
    throw httpError(409, 'That student ID is already used by another account', { student_id: 'Already in use' });
  }
  const updated = { ...user, name: name.trim(), student_id: student_id.trim(), course: course.trim(), year_level: year_level.trim(), avatar };
  write(USERS, users.map((u) => (u.id === user.id ? updated : u)));
  return { user: publicUser(updated) };
}

/* ---------- items (CRUD) ---------- */
// READ (list) with filters: q, type, category, status, user_id
function listItems({ query }) {
  currentUser();
  const users = read(USERS);
  const q = (query.get('q') || '').toLowerCase();
  const type = query.get('type');
  const status = query.get('status');
  const category = query.get('category');
  const userId = Number(query.get('user_id'));

  const items = read(ITEMS)
    .filter((i) => !type || i.type === type)
    .filter((i) => !status || i.status === status)
    .filter((i) => !category || i.category === category)
    .filter((i) => !userId || i.user_id === userId)
    .filter((i) => !q || [i.title, i.description, i.location].some((t) => (t || '').toLowerCase().includes(q)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
    .map((i) => withPoster(i, users));
  return { items };
}

function findItem(id) {
  const item = read(ITEMS).find((i) => i.id === Number(id));
  if (!item) throw httpError(404, 'That item no longer exists');
  return item;
}

function ownItem(id, action) {
  const user = currentUser();
  const item = findItem(id);
  if (item.user_id !== user.id && user.role !== 'admin') throw httpError(403, `You can only ${action} your own posts`);
  return item;
}

// READ (one)
function getItem({ params }) {
  currentUser();
  return { item: withPoster(findItem(params.id)) };
}

// CREATE
function createItem({ body = {} }) {
  const user = currentUser();
  failIfInvalid(validateItem(body));
  const items = read(ITEMS);
  const item = {
    id: nextId(items), user_id: user.id, type: body.type, title: body.title.trim(),
    category: body.category, location: body.location.trim(), date_event: body.date_event,
    description: (body.description || '').trim(), image: body.image || '',
    status: 'open', created_at: now(), updated_at: now(),
  };
  write(ITEMS, [...items, item]);
  return { item: withPoster(item) };
}

// UPDATE
function updateItem({ params, body = {} }) {
  const item = ownItem(params.id, 'edit');
  failIfInvalid(validateItem(body));
  const updated = {
    ...item, type: body.type, title: body.title.trim(), category: body.category,
    location: body.location.trim(), date_event: body.date_event,
    description: (body.description || '').trim(), image: body.image || '', updated_at: now(),
  };
  write(ITEMS, read(ITEMS).map((i) => (i.id === item.id ? updated : i)));
  return { item: withPoster(updated) };
}

// UPDATE status: open <-> resolved
function toggleItem({ params }) {
  const item = ownItem(params.id, 'update');
  const status = item.status === 'open' ? 'resolved' : 'open';
  const updated = { ...item, status, resolved_by_user_id: status === 'open' ? null : item.resolved_by_user_id || currentUser().id, updated_at: now() };
  write(ITEMS, read(ITEMS).map((i) => (i.id === item.id ? updated : i)));
  return { item: withPoster(updated) };
}

// Another student confirms they found or recognized an open item.
function claimItem({ params }) {
  const user = currentUser();
  const item = findItem(params.id);
  if (item.user_id === user.id) throw httpError(403, 'You cannot claim your own post');
  if (item.status === 'resolved') throw httpError(409, 'This item has already been marked as returned');
  const updated = { ...item, status: 'resolved', resolved_by_user_id: user.id, updated_at: now() };
  write(ITEMS, read(ITEMS).map((i) => (i.id === item.id ? updated : i)));
  return { item: withPoster(updated) };
}

// DELETE
function deleteItem({ params }) {
  const item = ownItem(params.id, 'delete');
  write(ITEMS, read(ITEMS).filter((i) => i.id !== item.id));
  return { ok: true };
}

/* ---------- tiny router ---------- */
const routes = [
  ['POST', /^\/auth\/register$/, register],
  ['POST', /^\/auth\/login$/, login],
  ['GET', /^\/auth\/me$/, me],
  ['PUT', /^\/users\/me$/, updateProfile],
  ['GET', /^\/items$/, listItems],
  ['POST', /^\/items$/, createItem],
  ['GET', /^\/items\/(?<id>\d+)$/, getItem],
  ['PUT', /^\/items\/(?<id>\d+)$/, updateItem],
  ['PATCH', /^\/items\/(?<id>\d+)\/resolve$/, toggleItem],
  ['PATCH', /^\/items\/(?<id>\d+)\/claim$/, claimItem],
  ['DELETE', /^\/items\/(?<id>\d+)$/, deleteItem],
];

export async function handle(method, path, body) {
  const url = new URL(path, 'http://local');
  for (const [verb, pattern, handler] of routes) {
    const match = verb === method && pattern.exec(url.pathname);
    if (match) return handler({ params: match.groups || {}, query: url.searchParams, body });
  }
  throw httpError(404, 'Unknown request');
}
