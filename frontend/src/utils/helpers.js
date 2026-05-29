export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatCurrency(amount, currency = 'EUR') {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
}

export function truncate(str, len = 120) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
}

export function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function groupBy(arr, key) {
  return (arr || []).reduce((acc, item) => {
    const k = item[key] || 'Uncategorized';
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}
