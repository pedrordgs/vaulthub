import { NextResponse } from 'next/server';

export function GET() {
  const robotsTxt = `# VaultHub Robots.txt
User-agent: *
Allow: /

Sitemap: https://vaulthub.vercel.app/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

