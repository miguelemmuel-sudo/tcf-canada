import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#D52B1E', // Rouge Canada
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 60,
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        TCF
      </div>
    ),
    { ...size }
  );
}
