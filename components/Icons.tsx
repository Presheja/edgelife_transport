export const S = { fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function Icon({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'wheelchair': return <svg {...p}><circle cx="9" cy="4" r="2" /><path d="M9 8v6h6l3 6M6 10a7 7 0 108.5 10.5" /></svg>;
    case 'calendar':   return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 2v5M16 2v5M12 13v5M9.5 15.5h5" /></svg>;
    case 'hospital':   return <svg {...p}><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-6h6v6M12 8v3M10.5 9.5h3" /></svg>;
    case 'senior':     return <svg {...p}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5M17 10.5l2.5 1.5" /></svg>;
    case 'building':   return <svg {...p}><path d="M4 20V9l8-5 8 5v11" /><rect x="8.5" y="13" width="7" height="7" /><path d="M2 20h20" /></svg>;
    case 'basket':     return <svg {...p}><path d="M4 7h16l-1.5 12.5a2 2 0 01-2 1.5H7.5a2 2 0 01-2-1.5L4 7z" /><path d="M9 7V5a3 3 0 016 0v2" /></svg>;
    case 'shield':     return <svg {...p}><path d="M12 2l8 3.5v6c0 5-3.4 9.3-8 10.5-4.6-1.2-8-5.5-8-10.5v-6L12 2z" /><path d="M9 12l2 2 4-4" /></svg>;
    case 'clock':      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    case 'heart':      return <svg {...p}><path d="M20.8 6.6a5 5 0 00-7.1 0L12 8.3l-1.7-1.7a5 5 0 00-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 000-7.1z" /></svg>;
    case 'check':      return <svg {...p} strokeWidth={2}><path d="M4 12.5l5 5L20 6.5" /></svg>;
    case 'phone':      return <svg {...p}><path d="M21.8 16.9v2.8a1.9 1.9 0 01-2.1 1.9 18.8 18.8 0 01-8.2-2.9 18.5 18.5 0 01-5.7-5.7A18.8 18.8 0 012.9 4.8 1.9 1.9 0 014.8 2.7h2.8a1.9 1.9 0 011.9 1.6c.1.9.4 1.8.7 2.7a1.9 1.9 0 01-.4 2l-1.2 1.2a15.2 15.2 0 005.7 5.7l1.2-1.2a1.9 1.9 0 012-.4c.9.3 1.8.6 2.7.7a1.9 1.9 0 011.7 2z" /></svg>;
    case 'pin':        return <svg {...p}><path d="M12 22s7.5-6.3 7.5-11.5a7.5 7.5 0 10-15 0C4.5 15.7 12 22 12 22z" /><circle cx="12" cy="10" r="2.7" /></svg>;
    case 'van':        return <svg {...p}><path d="M2 17V9l3-4h10l4 4h3v8" /><circle cx="7" cy="17" r="2.2" /><circle cx="17" cy="17" r="2.2" /><path d="M9.2 17h5.6M2 13h20" /></svg>;
    case 'wrench':     return <svg {...p}><path d="M14.5 6a4.5 4.5 0 005.9 5.9l-8.2 8.2a2.6 2.6 0 01-3.7-3.7L16.7 8" /><path d="M14.5 6L18 2.5" /></svg>;
    case 'flask':      return <svg {...p}><path d="M9 2v6.5L3.6 18A2 2 0 005.4 21h13.2a2 2 0 001.8-3L15 8.5V2" /><path d="M7.5 2h9M6.6 15h10.8" /></svg>;
    case 'file':       return <svg {...p}><path d="M14 2v6h6" /><path d="M19 21H5a1 1 0 01-1-1V4a1 1 0 011-1h9l6 6v11a1 1 0 01-1 1z" /><path d="M8 13h8M8 17h5" /></svg>;
    case 'user':       return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>;
    case 'arrow':      return <svg {...p} strokeWidth={1.8}><path d="M3 12h17M13 5l7 7-7 7" /></svg>;
    default:           return <svg {...p}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

export const Tick = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flex: '0 0 auto', marginTop: 3 }}>
    <circle cx="12" cy="12" r="10" fill="#F2F2E6" />
    <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#787A2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TickLight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flex: '0 0 auto', marginTop: 3 }}>
    <path d="M3 10.5l4 4 10-10" stroke="#C9CBA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
