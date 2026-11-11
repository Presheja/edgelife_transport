import type { Metadata } from 'next';
import PageHead from '@/components/PageHead';
import FeedbackForm from '@/components/FeedbackForm';
import { getCompany } from '@/lib/settings';
import { telHref } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Share Your Feedback',
  description: 'Tell EdgeLIFE Transport how your ride went. Your feedback goes straight to the team that runs the vans.',
  alternates: { canonical: '/feedback' },
};

export default async function Feedback() {
  const company = await getCompany();
  return (
    <>
      <PageHead crumb={[{ href: '/feedback', label: 'Feedback' }]}
        title="How did we do?"
        intro="Every comment is read by the people who hire the drivers and maintain the vans. If something went wrong, we want to know first." />
      <section>
        <div className="wrap">
          <div className="split">
            <div className="prose reveal">
              <p>Kind words help other families decide whether to trust us with someone they love. Hard words help us
                fix what went wrong before it happens to the next rider. Both are welcome here.</p>
              <p>If something needs attention today, such as a late pickup, a safety concern, or a problem with a driver,
                please call us at <a href={telHref(company.phone)} style={{ fontWeight: 600 }}>{company.phone}</a> so we can act on it now.</p>
            </div>
            <FeedbackForm phone={company.phone} />
          </div>
        </div>
      </section>
    </>
  );
}
