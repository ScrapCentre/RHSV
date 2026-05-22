import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_number } = body;

    if (!id_number || id_number.trim().length < 4) {
      return NextResponse.json(
        { error: 'Valid registration number is required (min 4 characters)' },
        { status: 400 }
      );
    }

    const formattedId = id_number.trim().toUpperCase();

    // SurePass JWT moved to env var (previously hardcoded in source — long-lived
    // credential leaked into the public repo; see security audit).
    // If unset, the route degrades to 503 — frontend consumers
    // (HomexHero, ValuationWizardCard) handle this via their existing
    // try/catch fallback to manual data entry.
    const surepassJwt = process.env.SUREPASS_JWT;
    if (!surepassJwt) {
      return NextResponse.json(
        { error: 'Vehicle lookup is temporarily unavailable. Please enter vehicle details manually.' },
        { status: 503 }
      );
    }

    const response = await fetch('https://kyc-api.surepass.app/api/v1/rc/rc-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${surepassJwt}`
      },
      body: JSON.stringify({
        id_number: formattedId,
        enrich: true
      })
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch vehicle details', details: data },
        { status: response.ok ? 400 : response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Vehicle lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching vehicle data' },
      { status: 500 }
    );
  }
}
