/* Referral network, modelled on the EdgeLIFE Referral Marketing & Client Acquisition SOP. */

export const ORG_TYPES = [
  { id: 'dialysis',        label: 'Dialysis center',              tier: 1 },
  { id: 'senior_living',   label: 'Senior living community',      tier: 1 },
  { id: 'assisted_living', label: 'Assisted living facility',     tier: 1 },
  { id: 'adult_day',       label: 'Adult day health program',     tier: 1 },
  { id: 'rehab',           label: 'Rehabilitation facility',      tier: 1 },
  { id: 'snf',             label: 'Skilled nursing facility',     tier: 1 },
  { id: 'home_health',     label: 'Home health agency',           tier: 2 },
  { id: 'home_care',       label: 'Home care agency',             tier: 2 },
  { id: 'primary_care',    label: 'Primary care practice',        tier: 2 },
  { id: 'specialty',       label: 'Specialty medical practice',   tier: 2 },
  { id: 'behavioral',      label: 'Behavioral health facility',   tier: 2 },
  { id: 'hospital',        label: 'Hospital / discharge planning', tier: 2 },
  { id: 'chc',             label: 'Community health center',      tier: 2 },
  { id: 'senior_center',   label: 'Senior center',                tier: 2 },
  { id: 'case_mgmt',       label: 'Case-management organization', tier: 2 },
  { id: 'other',           label: 'Other',                        tier: 2 },
] as const;

export const SOURCE_STATUSES = [
  { id: 'prospect',   label: 'Prospect',          hint: 'Identified, no meaningful contact yet' },
  { id: 'contacted',  label: 'Contacted',         hint: 'We have spoken or written to them' },
  { id: 'qualified',  label: 'Qualified',         hint: 'Right contact found, they accepted our info' },
  { id: 'activated',  label: 'Activated',         hint: 'First real ride request received' },
  { id: 'active',     label: 'Active',            hint: 'Sending rides recently' },
  { id: 'repeat',     label: 'Repeat',            hint: 'More than one referral' },
  { id: 'high_value', label: 'High value',        hint: 'Consistent ride volume' },
  { id: 'dormant',    label: 'Dormant',           hint: 'Was active, quiet lately' },
  { id: 'closed',     label: 'Closed',            hint: 'Not a fit, or asked for no contact' },
] as const;

export const TOUCH_KINDS = [
  { id: 'call',       label: 'Call (spoke with someone)' },
  { id: 'voicemail',  label: 'Call (left voicemail)' },
  { id: 'email',      label: 'Email' },
  { id: 'info_sent',  label: 'Sent EdgeLIFE info' },
  { id: 'visit',      label: 'In-person visit' },
  { id: 'after_ride', label: 'After-ride check-in' },
  { id: 'note',       label: 'Note' },
] as const;

export const DECLINE_REASONS = [
  { id: 'no_driver',     label: 'No driver available' },
  { id: 'no_vehicle',    label: 'Vehicle unavailable' },
  { id: 'outside_area',  label: 'Outside service area' },
  { id: 'schedule',      label: 'Scheduling conflict' },
  { id: 'payment',       label: 'Payment issue' },
  { id: 'short_notice',  label: 'Not enough notice' },
  { id: 'not_offered',   label: 'Service not offered' },
  { id: 'other',         label: 'Other' },
] as const;

export interface ReferralSource {
  id: string; created_at: string; organization: string; org_type: string | null; tier: number; area: string | null;
  contact_name: string | null; contact_role: string | null; phone: string | null; email: string | null;
  preferred_contact: string | null; status: string; info_sent: boolean; first_contacted: string | null;
  last_contact: string | null; next_follow_up: string | null; notes: string | null;
  campaign: string | null; gap_answer: string | null; gap_notes: string | null;
}

export interface ReferralTouch {
  id: string; created_at: string; source_id: string; touch_date: string; kind: string; outcome: string | null; created_by: string | null;
}

export const todayET = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** SOP section 6 cadence: Day 1 contact, Day 3-5 follow-up, Day 14 follow-up, then monthly. */
export function suggestedFollowUp(priorTouches: number, from = todayET()) {
  if (priorTouches === 0) return addDays(from, 4);
  if (priorTouches === 1) return addDays(from, 10);
  return addDays(from, 30);
}

/* The GATRA-gap discovery calls: one question, asked of a fixed set of organizations,
   to test whether the business is real before scaling outreach. */
export const GAP_CAMPAIGN = 'gatra_gap';
export const GAP_QUESTION = 'When a family here needs a ride that GATRA won\u2019t cover, what do you currently tell them?';
export const GAP_THRESHOLD = 4;
export const GAP_ANSWERS = [
  { id: 'no_good_answer', label: 'No good answer', hint: 'They have nothing reliable to offer. This is the gap.' },
  { id: 'has_answer',     label: 'They have an answer', hint: 'They already send families somewhere that works.' },
  { id: 'unclear',        label: 'Unclear / partial', hint: 'Something exists, but it is patchy or they hesitated.' },
] as const;

/** Statuses that ride activity can move a source past. */
export const PRE_ACTIVATION = ['prospect', 'contacted', 'qualified', 'dormant'];
