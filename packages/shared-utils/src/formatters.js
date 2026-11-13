export function formatINR(amount, options = {}) {
  const num = Number(amount ?? 0);
  if (Number.isNaN(num)) return '₹0.00';
  const { decimals = 2, compact = false } = options;

  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1)} K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatNumber(value) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function maskAccountNumber(value) {
  if (!value) return '—';
  const str = String(value).replace(/\s+/g, '');
  if (str.length <= 4) return str;
  return `${'•'.repeat(Math.max(4, str.length - 4))}${str.slice(-4)}`;
}

export function maskAadhaar(value) {
  if (!value) return '—';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length < 4) return value;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function maskPan(value) {
  if (!value) return '—';
  const str = String(value).toUpperCase();
  if (str.length < 10) return str;
  return `${str.slice(0, 2)}XXXXX${str.slice(7)}`;
}

export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'YP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
