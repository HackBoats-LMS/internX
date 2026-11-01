import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const isConfigured = Boolean(
    clientId &&
    clientSecret &&
    !clientId.includes('dummy') &&
    !clientId.includes('YOUR_GOOGLE') &&
    clientId.length > 10
  );

  return NextResponse.json({
    configured: isConfigured,
  });
}
