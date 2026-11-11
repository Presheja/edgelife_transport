'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/* Rendered once when a record is opened for the first time, so the sidebar
   badge re-counts right away instead of on the next page. */
export default function RefreshBadges() {
  const router = useRouter();
  useEffect(() => { router.refresh(); }, [router]);
  return null;
}
