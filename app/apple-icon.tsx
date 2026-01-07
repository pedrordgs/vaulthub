import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#1a1714',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 32,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c67f32"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Lock shackle */}
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#c67f32" stroke="none" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2.5" />
          {/* Keyhole */}
          <circle cx="12" cy="16" r="1.5" fill="#1a1714" stroke="none" />
          <rect x="11.25" y="16" width="1.5" height="3" fill="#1a1714" stroke="none" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
