const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function parse(iso) {
  if (!iso) return null;
  // Date-only strings are calendar dates, not instants: avoid timezone shifts.
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
}

export function formatDate(iso, precision = 'day') {
  const d = parse(iso);
  if (!d) return null;
  if (precision === 'month') return monthFmt.format(d);
  if (precision === 'year') return String(d.getFullYear());
  return dateFmt.format(d);
}

export function formatShortDate(iso) {
  const d = parse(iso);
  return d ? shortFmt.format(d) : null;
}

export function formatDateTime(iso) {
  const d = parse(iso);
  return d ? dateTimeFmt.format(d) : null;
}

export function formatMoney(amount, currency) {
  if (amount == null) return null;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency }).format(amount);
}

export function daysFromToday(iso) {
  const d = parse(iso);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

export function relativeDay(iso) {
  const n = daysFromToday(iso);
  if (n == null) return null;
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  if (n > 0) return n < 60 ? `in ${n} days` : `in about ${Math.round(n / 30)} months`;
  return n > -60 ? `${-n} days ago` : `about ${Math.round(-n / 30)} months ago`;
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Lowercase the first letter for mid-sentence use, but keep acronyms (MMR, HPV) intact. */
export function lcFirst(text) {
  if (!text) return text;
  if (text.length > 1 && text[1] === text[1].toUpperCase() && /[A-Z]/.test(text[1])) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}
