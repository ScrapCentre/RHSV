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

    const response = await fetch('https://kyc-api.surepass.app/api/v1/rc/rc-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcxNDM4NjYyMywianRpIjoiNWU0NTBhNjEtYzkzZS00NzRlLWFkNjItMWE4MmFmYjBjMzdiIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2Lm1lZGljYWxAc3VyZXBhc3MuaW8iLCJuYmYiOjE3MTQzODY2MjMsImV4cCI6MjM0NTEwNjYyMywiZW1haWwiOiJtZWRpY2FsQHN1cmVwYXNzLmlvIiwidGVuYW50X2lkIjoibWFpbiIsInVzZXJfY2xhaW1zIjp7InNjb3BlcyI6WyJ1c2VyIl19fQ.kXFo-Y5dcl5R7mQouTuaP5289-W3lMQgqb-2oLmWhis`
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
