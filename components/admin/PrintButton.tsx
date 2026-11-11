'use client';
export default function PrintButton({ label = 'Print or save as PDF' }: { label?: string }) {
  return <button type="button" className="abtn out no-print" onClick={() => window.print()}>{label}</button>;
}
