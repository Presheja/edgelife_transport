/** Trim and cap a user-supplied string so one request cannot stuff the database. */
export function str(v: unknown, max = 300): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
export function digits(v: string) { return v.replace(/\D/g, ''); }
export function validPhone(v: string) { const d = digits(v); return d.length >= 10 && d.length <= 15; }
export function validEmail(v: string) { return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
