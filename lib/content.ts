/* Site content as data. Pages are generated from these arrays, so adding a
   service or a town is one object here, not a new file to design.

   Things that change often (phone, address, hours, rates, testimonials,
   service-town lists) are NOT here. They live in Supabase and are edited in
   the admin area. See lib/settings.ts. */

export interface Service {
  slug: string; title: string; short: string; hero: string;
  body: string[]; bullets: string[]; icon: string;
}

export const SERVICES: Service[] = [
  {
    slug: 'wheelchair-accessible-transportation',
    title: 'Wheelchair-Accessible Transportation',
    short: 'Accessible vans with four-point securement. Your chair stays with you. No transfers, no lifting, no improvising.',
    hero: 'Roll on. Roll off. Nobody lifts anybody.',
    icon: 'wheelchair',
    body: [
      'The most dangerous moment in a medical trip is almost never the drive. It is the transfer: someone being lifted out of a wheelchair and into a car seat by a person who has not been trained to do it. That is where the falls happen, where shoulders get hurt, and where dignity quietly goes out the window.',
      'We do not transfer anyone. Our accessible vans let the rider stay in their own chair for the entire trip. The chair is locked down with a four-point securement system, and the rider gets a separate lap and shoulder belt.',
      'Manual chairs, power chairs and scooters are all welcome. If you are unsure whether your equipment will fit, call us with the make and model and we will tell you honestly, before you book.',
    ],
    bullets: [
      'Four-point securement on every chair',
      'Power chairs and mobility scooters accommodated',
      'Separate occupant restraint, not just the chair tie-down',
      'Drivers trained in passenger assistance and securement',
      'Ride confirmed with a price before you commit',
    ],
  },
  {
    slug: 'medical-appointments-and-treatment',
    title: 'Medical Appointments & Treatment',
    short: 'Dialysis, oncology, infusion, physical therapy. Standing weekly rides so you are not rebooking every time.',
    hero: 'The appointment you cannot miss.',
    icon: 'calendar',
    body: [
      'Dialysis three times a week. Infusion every other Tuesday. Physical therapy on a schedule the insurer will not extend. These are not appointments you can casually reschedule, and a transportation no-show is not an inconvenience. It is a missed treatment.',
      'When you book a recurring trip, we set it up once and it stays on the schedule. Tell us the days, the times and the address, and we plan around it.',
      'Many MassHealth members get rides to covered medical visits through GATRA, which arranges MassHealth transportation in Southeastern Massachusetts. We are here for the rides that program does not cover: same-day changes, evenings and weekends, and everything that is not a medical visit.',
    ],
    bullets: [
      'Recurring weekly rides set up in one call',
      'We can wait through the appointment or return at a set time',
      'Dialysis, oncology, infusion, dental, imaging, physical therapy',
      'Rides GATRA does not cover: same-day, evenings, weekends',
      'Price confirmed before the ride',
    ],
  },
  {
    slug: 'hospital-discharge-rides',
    title: 'Hospital Discharge Rides',
    short: 'Discharged mid-afternoon and need to get home today? Call dispatch and we will tell you honestly what we can do.',
    hero: 'Discharged at 4pm. Home tonight.',
    icon: 'hospital',
    body: [
      'Hospital discharges do not happen on a schedule. The doctor signs off mid-afternoon, the case manager calls the family, and suddenly someone needs to get a person who cannot walk from a hospital room to a home across town.',
      'Call dispatch, give us the hospital and the unit, and we will tell you a realistic window on the phone rather than promising something we cannot do.',
      'Our drivers come to the unit, not just the parking garage, and get the rider settled at home: inside the door, not on the front step in February.',
    ],
    bullets: [
      'Call early in the day for the best chance of same-day availability',
      'Unit-level pickup, not just curbside',
      'Taunton, Brockton, Attleboro and Boston-area hospitals',
      'We get the rider inside the home, not to the doorstep',
      'Case managers and discharge planners can book for families',
    ],
  },
  {
    slug: 'senior-and-assisted-transportation',
    title: 'Senior & Assisted Living Transport',
    short: 'Door-through-door. We come inside, help with coats and walkers, and hand your parent to the receptionist, not the parking lot.',
    hero: 'Door-through-door. Not curb-and-pray.',
    icon: 'senior',
    body: [
      'There is a phrase in this industry, "curb-to-curb", and it means exactly what it sounds like. The driver stops at the curb. What happens between the curb and the front door is the passenger\'s problem.',
      'For an eighty-four-year-old with a walker and a February sidewalk, that is not a service. It is a liability dressed up as one.',
      'We do door-through-door as standard. The driver parks, walks to the door, helps with coats and bags and the walker, escorts the rider all the way in, and does not leave until they have been handed to a receptionist, a nurse, or a family member.',
    ],
    bullets: [
      'Escort from inside the home to inside the destination',
      'Assistance with coats, bags, walkers and canes',
      'Coordination with assisted living and memory care staff',
      'Rides to appointments, hair salons, family visits and church',
      'Ask about a consistent driver for riders with memory loss',
    ],
  },
  {
    slug: 'adult-day-care-centers',
    title: 'Adult Day Care Programs',
    short: 'Reliable routes for programs across Bristol, Plymouth and Norfolk counties. Talk to us about facility accounts.',
    hero: 'The route that runs whether or not it snows.',
    icon: 'building',
    body: [
      'Adult day health programs live or die on transportation. If the van does not come, the participant does not attend, the program does not bill, and the family loses the one day of respite they were counting on.',
      'We work with programs and facilities in the Taunton area on regular routes. Program directors can call dispatch directly to set up or change a route.',
      'If you run a program or a facility and want to talk about accounts and invoicing, call or email us and we will put together a plan that fits your schedule.',
    ],
    bullets: [
      'Regular daily and weekly routes with fixed windows',
      'Direct line to dispatch for program directors',
      'Facility accounts and invoicing: just ask',
      'Multi-participant vans reduce cost per rider',
      'Wheelchair and ambulatory riders on the same route',
    ],
  },
  {
    slug: 'shopping-errands-and-group-events',
    title: 'Errands, Shopping & Family Events',
    short: 'Private-pay rides for life beyond the clinic: groceries, the salon, a family wedding, church. Rides GATRA will not take.',
    hero: 'Life is not only appointments.',
    icon: 'basket',
    body: [
      'Almost every company in this industry will take someone to dialysis and nowhere else. Which quietly tells a person in a wheelchair that their life now consists of medical appointments and waiting rooms.',
      'We do not think that is right, and we book the rest of it too. Grocery shopping. The hairdresser. A grandchild\'s graduation. Church on Sunday morning. A daughter\'s wedding where somebody needs the van to wait.',
      'There is no medical justification required, because there should not have to be one. Tell us where you are going and we will quote the ride before you commit.',
    ],
    bullets: [
      'Groceries, pharmacy, salon, bank, and everyday errands',
      'Weddings, funerals, church, family events and holidays',
      'Wait-and-return trips quoted up front',
      'No medical reason needed',
      'Group rides for several riders travelling together',
    ],
  },
];

export interface Vehicle {
  name: string; img: string; alt: string; copy: string; specs: string[];
}

export const FLEET: Vehicle[] = [
  {
    name: 'Full-Size Accessible Van',
    img: '/img/van-transit.jpg',
    alt: 'EdgeLIFE full-size wheelchair-accessible van',
    copy: 'Room for a power chair plus family or an aide. A good fit for riders who need extra space, and for group runs to an adult day program.',
    specs: ['Wheelchair accessible', 'Room for companions', 'High roof'],
  },
  {
    name: 'Accessible Minivan',
    img: '/img/van-minivan.jpg',
    alt: 'EdgeLIFE wheelchair-accessible minivan with rear ramp deployed',
    copy: 'Lowered floor with a rear ramp. Easier to get in and out of, and easier to park at a townhouse or a tight medical garage.',
    specs: ['Rear ramp', 'Lowered floor', 'Wheelchair accessible'],
  },
];

export interface Area {
  slug: string; town: string; note: string; county: string;
  /** Rough one-way driving distance from the Taunton garage. Used for a sample fare, labelled "about". */
  miles: number;
  /** Where riders from this town most often need to go. Real, named places only. */
  destinations: string[];
  /** One sentence only true of this town. */
  local: string;
}

/* Ten featured town pages, kept deliberately small. A page per town for
   seventy towns would be thin, near-duplicate content that search engines
   penalize. Each page carries facts specific to that town so none of them
   is a copy of another. The full list of towns we serve is managed in admin. */
export const AREAS: Area[] = [
  { slug: 'taunton', town: 'Taunton', county: 'Bristol', note: 'Our home base · Morton Hospital', miles: 3,
    destinations: ['Morton Hospital', 'Dialysis and outpatient centers in Taunton', 'Taunton adult day health programs'],
    local: 'Our vans are garaged right here in Taunton, so a pickup across the city is the shortest and most dependable trip we run.' },
  { slug: 'raynham', town: 'Raynham', county: 'Bristol', note: 'Assisted living and home care agencies', miles: 5,
    destinations: ['Morton Hospital in Taunton', 'Medical offices along Route 138', 'Assisted living residences in Raynham'],
    local: 'Raynham borders Taunton, so most Raynham pickups are only a few minutes from where our vans start the day.' },
  { slug: 'easton', town: 'Easton', county: 'Bristol', note: 'North Easton and senior living communities', miles: 11,
    destinations: ['Good Samaritan Medical Center in Brockton', 'Morton Hospital in Taunton', 'Senior living communities in North Easton'],
    local: 'We pick up across North Easton, South Easton and Easton Center, including the senior living communities near Five Corners.' },
  { slug: 'norton', town: 'Norton', county: 'Bristol', note: 'Senior living communities and local medical offices', miles: 9,
    destinations: ['Sturdy Memorial Hospital in Attleboro', 'Morton Hospital in Taunton', 'Senior living communities on Mansfield Avenue'],
    local: 'Norton sits between Taunton and Attleboro, which puts both Morton Hospital and Sturdy Memorial within an easy ride.' },
  { slug: 'mansfield', town: 'Mansfield', county: 'Bristol', note: 'Senior living and medical offices', miles: 14,
    destinations: ['Sturdy Memorial Hospital in Attleboro', 'Medical offices in Mansfield', 'Senior living communities in Mansfield'],
    local: 'Mansfield riders most often head to Attleboro or Taunton for care, and we plan the route around the I-495 traffic.' },
  { slug: 'attleboro', town: 'Attleboro', county: 'Bristol', note: 'Sturdy Memorial Hospital', miles: 15,
    destinations: ['Sturdy Memorial Hospital', 'Dialysis and outpatient centers in Attleboro', 'Providence hospitals by arrangement'],
    local: 'Attleboro is home to Sturdy Memorial Hospital, and it is also our jumping-off point for appointments in Providence.' },
  { slug: 'lakeville', town: 'Lakeville', county: 'Plymouth', note: 'Residential and senior living', miles: 11,
    destinations: ['Morton Hospital in Taunton', 'Medical offices in Middleborough', 'Hospitals in New Bedford by arrangement'],
    local: 'Lakeville homes are spread out along the lakes and back roads, so we confirm the pickup door and driveway when you book.' },
  { slug: 'middleborough', town: 'Middleborough', county: 'Plymouth', note: 'Medical offices and senior housing', miles: 12,
    destinations: ['Morton Hospital in Taunton', 'Brockton Hospital', 'Medical offices in Middleborough Center'],
    local: 'Middleborough is one of the largest towns by area in the state, so we quote from the actual pickup address, not the town center.' },
  { slug: 'bridgewater', town: 'Bridgewater', county: 'Plymouth', note: 'Medical offices and senior housing', miles: 13,
    destinations: ['Brockton Hospital', 'Good Samaritan Medical Center in Brockton', 'Medical offices in Bridgewater'],
    local: 'Most Bridgewater riders are headed north to the Brockton hospitals, a short run up Route 24 or Route 28.' },
  { slug: 'brockton', town: 'Brockton', county: 'Plymouth', note: 'Brockton Hospital · Good Samaritan Medical Center', miles: 16,
    destinations: ['Brockton Hospital', 'Good Samaritan Medical Center', 'Dialysis and outpatient centers in Brockton'],
    local: 'Brockton has two hospitals, Brockton Hospital and Good Samaritan Medical Center, and we drive to both every week.' },
];

/* --------------------------------------------------------------------------
   SAFETY STANDARDS
   Each item below is a claim the business is making in public. EdgeLIFE must
   actually be doing it before this page goes live. `verify` marks the ones
   leadership has not yet confirmed in writing. Remove or edit any that are
   not true today.
   ------------------------------------------------------------------------ */
export interface Standard { title: string; detail: string; verify?: boolean }

export const DRIVER_STANDARDS: Standard[] = [
  { title: 'Drug screened before hire, and at random after', detail: 'Every driver passes a pre-employment panel screen. After that, testing is random and unannounced, because a test you can plan for is not a test. Any positive result ends the assignment that day.', verify: true },
  { title: 'Tested after any accident', detail: 'Post-incident screening within 32 hours, no exceptions and no discretion. The policy is written down so nobody has to make a judgement call in a bad moment.', verify: true },
  { title: 'CORI and SORI background checked', detail: 'Massachusetts criminal record and sex offender registry checks on every driver before they carry a single passenger, with a seven-year lookback.', verify: true },
  { title: 'Driving record pulled and monitored', detail: 'Full RMV record on hire and annually after. DUI within seven years, reckless driving within five, or any vehicular homicide is an automatic disqualification.', verify: true },
  { title: 'Trained in passenger assistance, not just driving', detail: 'Training in wheelchair securement, ADA compliance, transfer safety, and how to work with riders who have dementia or limited communication.', verify: true },
];

export const VEHICLE_STANDARDS: Standard[] = [
  { title: 'Inspected before every single shift', detail: 'A documented pre-trip inspection (brakes, tires, lights, ramp and lift cycle, securement hardware) signed by the driver before the first pickup of the day. Not a glance. A checklist.', verify: true },
  { title: 'No vehicle over ten years old', detail: 'The industry standard used by national brokers, and ours. When a van reaches the limit it comes off the road, regardless of how well it is running.', verify: true },
  { title: 'Brakes and lifts on a service schedule, not a complaint schedule', detail: 'Preventive maintenance at fixed mileage intervals with written logs. A brake job happens because the odometer says so, never because someone noticed a noise.', verify: true },
  { title: 'Ramps and lifts function-tested daily', detail: 'The ramp or lift is cycled and the securement straps are inspected every morning. A ramp that fails at a hospital entrance strands a rider in the cold, so we find it in the lot instead.', verify: true },
  { title: 'GPS tracked and sanitized between riders', detail: 'Live location on every vehicle so dispatch can tell you exactly where the van is, and a full wipe-down of contact surfaces between passengers.' },
];

export const CREDENTIALS = [
  '$1.5M commercial liability',
  'Contracted with MassHealth transportation brokers',
  'CORI & SORI background checked',
  'Four-point wheelchair securement',
  'Licensed & insured in Massachusetts',
];
