/* Visitor feedback: labels and the public credit line.
   Only the credit and the relationship are ever published. Never the full name, email, or phone. */

export const RELATIONSHIPS = [
  { id: 'rider',        label: 'I ride with EdgeLIFE',            credit: 'EdgeLIFE rider' },
  { id: 'family',       label: 'Someone in my family rides',      credit: 'Family of an EdgeLIFE rider' },
  { id: 'professional', label: 'I refer or care for riders',      credit: 'Care professional' },
  { id: 'other',        label: 'Other',                           credit: 'EdgeLIFE customer' },
] as const;

export const CREDITS = [
  { id: 'first_initial', label: 'First name and last initial (e.g. Maria S.)' },
  { id: 'initials',      label: 'Initials only (e.g. M.S.)' },
  { id: 'anonymous',     label: 'No name at all' },
] as const;

export const FEEDBACK_STATUSES = [
  { id: 'new',       label: 'New' },
  { id: 'reviewed',  label: 'Reviewed' },
  { id: 'published', label: 'Published' },
  { id: 'hidden',    label: 'Not for publishing' },
] as const;

export interface Feedback {
  id: string; created_at: string; seen_at: string | null; name: string; email: string | null;
  relationship: string | null; rating: number | null; message: string; allow_publish: boolean;
  credit: string; status: string; testimonial_id: string | null;
}

/** The name shown publicly, built only from what the writer agreed to. */
export function creditName(name: string, credit: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (credit === 'anonymous' || parts.length === 0) return 'Anonymous';
  const first = parts[0], last = parts.length > 1 ? parts[parts.length - 1] : '';
  if (credit === 'initials') return (first[0] + '.' + (last ? last[0] + '.' : '')).toUpperCase();
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

export const creditRole = (relationship: string | null) =>
  RELATIONSHIPS.find(r => r.id === relationship)?.credit ?? 'EdgeLIFE customer';
