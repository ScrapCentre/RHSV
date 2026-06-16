const http = require("http");

const data = JSON.stringify({ id_number: "up&*FR2872" });

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/vehicle-lookup",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let responseBody = "";

  res.on("data", (chunk) => {
    responseBody += chunk;
  });

  res.on("end", () => {
    console.log("Response Body:");
    try {
      console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
    } catch {
      console.log(responseBody);
    }
  });
});

req.on("error", (error) => {
  console.error("Error making request:", error.message);
});

req.write(data);
req.end();
