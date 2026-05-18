import * as http from 'http';

const url = 'http://localhost:3001/api/admin/valuations/quote/6a0ae20d78f06eb2a0d253b8';

console.log("Sending GET request to local Next.js server...");
http.get(url, (res) => {
    let data = '';
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log("Response Body:");
        try {
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log(data);
        }
        process.exit(0);
    });
}).on('error', (err) => {
    console.error("HTTP Request Error:", err);
    process.exit(1);
});
