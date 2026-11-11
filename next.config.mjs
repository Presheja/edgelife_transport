/** @type {import('next').NextConfig} */

/* ---------------------------------------------------------------------------
   301 REDIRECT MAP — old WordPress URLs -> new URLs.
   Every one of the 26 pages Google currently has indexed is mapped here.
   Without this file the rebuild throws away the site's existing search
   rankings on day one. Do not delete it, even years from now.
   ------------------------------------------------------------------------- */
const OLD = 'non-emergency-medical-transportation';
const redirects = async () => ([
  { source: `/${OLD}-about`,                          destination: '/safety',   permanent: true },
  { source: `/${OLD}-meet-our-staff`,                 destination: '/safety',   permanent: true },
  { source: `/${OLD}-faqs`,                           destination: '/pricing',  permanent: true },
  { source: `/${OLD}-insurance-accepted`,             destination: '/pricing',  permanent: true },
  { source: `/${OLD}-contact-us`,                     destination: '/book',     permanent: true },
  { source: `/${OLD}-contact-us/free-estimate`,       destination: '/pricing',  permanent: true },
  { source: `/${OLD}-contact-us/mileage-tracker`,     destination: '/pricing',  permanent: true },
  { source: `/${OLD}-book-a-ride`,                    destination: '/book',     permanent: true },
  { source: `/${OLD}-lets-get-started`,               destination: '/book',     permanent: true },
  { source: `/${OLD}-service-areas-covered`,          destination: '/service-areas', permanent: true },
  { source: `/${OLD}-fleet`,                          destination: '/fleet',    permanent: true },
  { source: `/${OLD}-careers`,                        destination: '/careers',  permanent: true },
  { source: `/${OLD}-read-our-testimonials`,          destination: '/',         permanent: true },
  { source: `/${OLD}-services`,                       destination: '/services', permanent: true },
  { source: `/${OLD}-services/health-appointments-and-treatments`, destination: '/services/medical-appointments-and-treatment', permanent: true },
  { source: `/${OLD}-services/dentist-appointments`,              destination: '/services/medical-appointments-and-treatment', permanent: true },
  { source: `/${OLD}-services/hospital-discharge-rides`,          destination: '/services/hospital-discharge-rides', permanent: true },
  { source: `/${OLD}-services/senior-and-assisted-transportation`,destination: '/services/senior-and-assisted-transportation', permanent: true },
  { source: `/${OLD}-services/adult-day-care-centers`,            destination: '/services/adult-day-care-centers', permanent: true },
  { source: `/${OLD}-services/wheelchair-accessible-transportation`, destination: '/services/wheelchair-accessible-transportation', permanent: true },
  { source: `/${OLD}-services/shopping-trips`,                    destination: '/services/shopping-errands-and-group-events', permanent: true },
  { source: `/${OLD}-services/group-events`,                      destination: '/services/shopping-errands-and-group-events', permanent: true },
  { source: '/edge-life-transportation-do-not-sell-or-share-my-personal-information', destination: '/privacy', permanent: true },
  { source: '/privacy-notice', destination: '/privacy',       permanent: true },
  { source: '/sitemap',        destination: '/service-areas', permanent: true },
]);

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  redirects,
};
export default nextConfig;
