

async function run() {
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcxNDM4NjYyMywianRpIjoiNWU0NTBhNjEtYzkzZS00NzRlLWFkNjItMWE4MmFmYjBjMzdiIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2Lm1lZGljYWxAc3VyZXBhc3MuaW8iLCJuYmYiOjE3MTQzODY2MjMsImV4cCI6MjM0NTEwNjYyMywiZW1haWwiOiJtZWRpY2FsQHN1cmVwYXNzLmlvIiwidGVuYW50X2lkIjoibWFpbiIsInVzZXJfY2xhaW1zIjp7InNjb3BlcyI6WyJ1c2VyIl19fQ.kXFo-Y5dcl5R7mQouTuaP5289-W3lMQgqb-2oLmWhis';
  try {
    const response = await fetch('https://kyc-api.surepass.app/api/v1/rc/rc-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_number: 'DL1CAB1234',
        enrich: true
      })
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
