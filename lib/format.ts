/** Small formatting helpers shared by pages and components. */

export const telHref = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return 'tel:' + (digits.length === 10 ? '+1' + digits : digits.startsWith('1') ? '+' + digits : digits);
};

export const money = (n: number) => {
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export const cityLine = (c: { city: string; state: string; zip: string }) => `${c.city}, ${c.state} ${c.zip}`;
