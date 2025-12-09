import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'UpSosh - Discover & Book Exclusive Events';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
                    color: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Simple Logo Representation */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '60px',
                        fontWeight: 'bold'
                    }}>
                        S
                    </div>
                    <span style={{ fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #ccc)', backgroundClip: 'text', color: 'transparent' }}>UpSosh</span>
                </div>
                <div style={{ fontSize: 40, marginTop: 40, color: '#888' }}>
                    Discover. Book. Experience.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
