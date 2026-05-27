async function getPublicIp() {
  console.log("Fetching your current public IP address...");
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (res.ok) {
      const data = await res.json();
      console.log("\n==================================================");
      console.log("Your Public IP Address is:", data.ip);
      console.log("==================================================");
      console.log("\nSteps to whitelist this IP in MongoDB Atlas:");
      console.log("1. Log in to your MongoDB Atlas Account (https://cloud.mongodb.com).");
      console.log("2. In the left side menu, click 'Network Access' under the 'Security' section.");
      console.log("3. Click the '+ Add IP Address' button.");
      console.log("4. Enter your IP address:", data.ip);
      console.log("   (Or click 'Add Current IP Address' to fetch it automatically, or set it to '0.0.0.0/0' to allow connections from anywhere during development).");
      console.log("5. Click 'Confirm' and wait 1-2 minutes for the status to become 'Active'.");
    } else {
      console.error("Failed to fetch public IP.");
    }
  } catch (e: any) {
    console.error("Error retrieving IP:", e.message);
  }
}

getPublicIp();
