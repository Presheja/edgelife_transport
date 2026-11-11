import PageHead from '@/components/PageHead';
import { getCompany } from '@/lib/settings';

export const metadata = { title: 'Privacy Notice', alternates: { canonical: '/privacy' } };

export default async function Page() {
  const c = await getCompany();
  return (
    <>
      <PageHead title="Privacy Notice" intro="What we collect when you ask for a ride, why, and who sees it. Last updated October 2026." />
      <section><div className="wrap"><div className="prose">
        <h2 style={{ fontSize: '1.5rem', marginTop: 8 }}>What we collect</h2>
        <p>When you request a ride we ask for the rider&rsquo;s name and phone number, the pickup and destination, the date and time,
          and the kind of help the rider needs (for example a wheelchair, a walker, or memory loss). You may also give us an email address,
          the name of a family member or case manager, how you plan to pay, and notes such as an oxygen tank or a service dog.
          When you apply to drive, we collect your name, contact details, town, license class, driving and wheelchair experience, and availability.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Why we collect it</h2>
        <p>Only to do the job: to call you back, send the right vehicle, price the ride, carry it out safely, and keep a record of it.
          Applicant information is used to consider you for a position and to run the screening required to drive for us.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Who sees it</h2>
        <p>Our dispatchers and managers see ride requests. A driver sees what they need to complete a trip, such as the rider&rsquo;s name,
          address, destination and any assistance needed. We use trusted service providers to run the website and store submissions
          (our database and hosting providers, and our email provider). They handle your information only on our behalf and under their own security commitments.
          We share information with others only when the law requires it, or when a rider&rsquo;s safety depends on it, for example with emergency responders.</p>
        <h2 id="dns" style={{ fontSize: '1.5rem', marginTop: 32 }}>We do not sell your information</h2>
        <p>We do not sell or rent personal information, and we do not share it for advertising. There is nothing to opt out of.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>How long we keep it</h2>
        <p>Ride records are kept as long as we need them for scheduling, billing, safety and legal obligations. Applications are kept while a position
          may be open and then removed. You can ask us to delete your information at any time, and we will unless the law requires us to keep it.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Cookies and analytics</h2>
        <p>This website does not use advertising cookies. If we add analytics later, this notice will say so.</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: 32 }}>Your choices</h2>
        <p>You can ask to see what we have about you, correct it, or delete it. Email
          <a href={`mailto:${c.email}`} style={{ color: 'var(--steel)' }}> {c.email}</a> or call {c.phone}.
          {' '}{c.name}, {c.street}, {c.city}, {c.state} {c.zip}.</p>
        <p>Please do not send medical records, Social Security numbers or payment card details through the website forms. Give those to dispatch by phone when asked.</p>
      </div></div></section>
    </>
  );
}
