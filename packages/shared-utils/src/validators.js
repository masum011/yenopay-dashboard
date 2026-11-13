export function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(String(mobile || '').trim());
}

export function isValidAadhaar(aadhaar) {
  return /^\d{12}$/.test(String(aadhaar || '').replace(/\s+/g, ''));
}

export function isValidIFSC(ifsc) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc || '').trim().toUpperCase());
}

export function isValidPAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(String(pan || '').trim().toUpperCase());
}

export function isValidAccountNumber(acc) {
  return /^\d{9,18}$/.test(String(acc || '').trim());
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function validateAmount(amount, min = 1, max = 500000) {
  const num = Number(amount);
  if (Number.isNaN(num) || num <= 0) return 'Enter a valid amount greater than ₹0.';
  if (num < min) return `Minimum amount is ₹${min}.`;
  if (num > max) return `Maximum single transaction limit is ₹${max.toLocaleString('en-IN')}.`;
  return null;
}
