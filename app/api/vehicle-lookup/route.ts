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

    const cleanId = formattedId.replace(/[^A-Z0-9]/g, '');
    if (cleanId === 'UP14X6100') {
      return NextResponse.json({
        success: true,
        data: {
          client_id: 'UP14X6100_MOCK',
          maker_description: 'Hyundai',
          model_description: 'sentro',
          registration_date: '2005-01-01',
          vehicle_weight: '856',
          fuel_type: 'Petrol'
        }
      });
    }

    const response = await fetch('https://kyc-api.surepass.app/api/v1/rc/rc-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_TOKEN}`
      },
      body: JSON.stringify({
        id_number: formattedId,
        enrich: true
      })
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        { error: data.message || data.message_code || 'Failed to fetch vehicle details', details: data },
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
