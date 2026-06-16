async function run() {
  try {
    const response = await fetch('http://localhost:3000/api/vehicle-lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_number: 'UP14X6100'
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
