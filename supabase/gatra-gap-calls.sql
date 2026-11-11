-- EdgeLIFE: GATRA-gap discovery calls.
-- Adds the discovery-answer fields and loads the 9 organizations to call.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again (no duplicates).

alter table referral_sources add column if not exists campaign text;     -- e.g. 'gatra_gap'
alter table referral_sources add column if not exists gap_answer text;   -- no_good_answer | has_answer | unclear
alter table referral_sources add column if not exists gap_notes text;    -- what they tell families today

insert into referral_sources (organization, org_type, tier, area, phone, contact_name, contact_role, status, next_follow_up, campaign, notes)
select v.organization, v.org_type, v.tier, v.area, v.phone, v.contact_name, v.contact_role, 'prospect', current_date, 'gatra_gap', v.notes
from (values
  ('The Arbors at Taunton', 'assisted_living', 1, '763 County St, Taunton, MA 02780', '(508) 824-4800', null, null,
   'The only certified assisted living residence in Taunton. 78 units, 25 memory care. Family owned. Ask for resident services or the executive director.'),
  ('All American Assisted Living at Raynham', 'assisted_living', 1, '1084 Broadway, Raynham, MA 02767', '(508) 822-9400', 'Shanice Rodrigues', 'Executive Director (per May 2025 state report, verify)',
   '58 units, 13 memory care. Next door to Taunton. The state listing also shows (508) 822-9402.'),
  ('The Residence at Great Woods', 'assisted_living', 1, '190 Mansfield Ave, Norton, MA 02766', '(508) 285-3355', null, null,
   '92 units, 28 memory care. The largest memory-care count in the ring.'),
  ('The Residence at Five Corners', 'assisted_living', 1, '678 Depot St, Easton, MA 02356', '(508) 535-2203', 'Michael Volpe', 'Executive Director (listed April 2026, verify)',
   '84 units, 20 memory care, in a $124K-income town. An LCB Senior Living community.'),
  ('Village at Willow Crossings', 'assisted_living', 1, '25 Cobb St, Mansfield, MA 02048', '(508) 261-1333', null, null,
   '104 units, 18 memory care. Managed by Benchmark Senior Living. Some listings mention their own transportation, so ask where it stops.'),
  ('HomeWell Care Services of Taunton', 'home_care', 2, 'Taunton, MA', null, 'Luis and Carla Darosa', 'Owners',
   'One of only two home care agencies with a Taunton street address. No public phone found: get it from their website or Google listing.'),
  ('Rivers of Hope', 'home_care', 2, '189 Broadway, Taunton, MA 02780', '(508) 857-0629', 'Francineglide Victoria', 'Founder',
   'The other home care agency with a Taunton street address. Also serves veterans.'),
  ('Visiting Angels of Raynham', 'home_care', 2, '473 South St W, Suite 18, Raynham, MA 02767', '(774) 501-3861', null, null,
   'Covers Taunton, Berkley, Dighton, Bridgewater, Middleborough. Their site says caregivers take clients out, so ask whether that works for wheelchair riders.'),
  ('Senior Helpers of Southeastern Massachusetts', 'home_care', 2, '90 New State Hwy, Suite 1, Raynham, MA 02767', '(508) 692-6422', null, null,
   'Listings say they offer transportation and doctor-visit companionship. Find where that stops (wheelchairs, distance, timing). That edge is the opening.')
) as v(organization, org_type, tier, area, phone, contact_name, contact_role, notes)
where not exists (select 1 from referral_sources r where lower(r.organization) = lower(v.organization));

-- If any of these were already in the table, tag them for the tally too.
update referral_sources set campaign = 'gatra_gap'
where campaign is null and organization in (
  'The Arbors at Taunton', 'All American Assisted Living at Raynham', 'The Residence at Great Woods',
  'The Residence at Five Corners', 'Village at Willow Crossings', 'HomeWell Care Services of Taunton',
  'Rivers of Hope', 'Visiting Angels of Raynham', 'Senior Helpers of Southeastern Massachusetts');
