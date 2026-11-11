import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND } from '@/lib/site';

/* The preview card shown when a link to the site is texted, emailed or posted.
   Built from a real EdgeLIFE van photo, never stock. */
export const alt = `${BRAND}: wheelchair and medical rides in Taunton, MA`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const photo = await readFile(join(process.cwd(), 'public/img/van-ramp.jpg'));
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', position: 'relative', backgroundColor: '#011D42' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={680} height={630} style={{ position: 'absolute', left: 520, top: 0, width: 680, height: 630, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', left: 520, top: 0, width: 220, height: 630, display: 'flex', backgroundImage: 'linear-gradient(90deg, #011D42 0%, rgba(1,29,66,0) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 600, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 64px' }}>
          <div style={{ display: 'flex', fontSize: 20, letterSpacing: 4, color: '#C9CBA3' }}>TAUNTON · SOUTHEASTERN MA</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 58, lineHeight: 1.08, color: '#FFFFFF', marginTop: 22, fontWeight: 600 }}>
            <span>Wheelchair &amp;</span><span>medical rides,</span><span>priced in public.</span>
          </div>
          <div style={{ display: 'flex', fontSize: 25, color: 'rgba(255,255,255,0.78)', marginTop: 24, width: 470 }}>Screened drivers. Vans inspected before every shift.</div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 40 }}>
            <div style={{ display: 'flex', width: 14, height: 14, borderRadius: 7, backgroundColor: '#AF3123', marginRight: 14 }} />
            <div style={{ display: 'flex', fontSize: 30, color: '#FFFFFF', fontWeight: 600 }}>{BRAND}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
