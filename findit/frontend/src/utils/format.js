// Plain helper functions. They are reused by BOTH the mixin (Options API)
// and the composable (Composition API), so you can compare the two styles.
const toDate = (v) => new Date(String(v).replace(' ', 'T'));

export function formatDate(value) {
  if (!value) return '';
  const d = toDate(value);
  if (isNaN(d)) return String(value);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(value) {
  const d = toDate(value);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (isNaN(s)) return '';
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(value);
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}

export function todayISO() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
