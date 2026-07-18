import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

// Image generation
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
          fontSize: 180,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          borderRadius: 80,
        }}
      >
        TCF
      </div>
    ),
    {
      ...size,
    }
  );
}
