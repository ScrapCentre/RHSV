"use server";

export async function lookupVehicle(idNumber: string) {
  try {
    if (!idNumber || idNumber.trim().length < 4) {
      return { error: "Valid registration number is required (min 4 characters)" };
    }

    const formattedId = idNumber.trim().toUpperCase();

    const token = process.env.SUREPASS_API_TOKEN;
    const publicKey = process.env.SUREPASS_PUBLIC_KEY;
    const privateKey = process.env.SUREPASS_PRIVATE_KEY;

    if (!token && !publicKey && !privateKey) {
      return { error: "Surepass API credentials are not configured on the server." };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Set headers based on available credentials
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (publicKey && privateKey) {
      headers["X-API-Public-Key"] = publicKey;
      headers["X-API-Private-Key"] = privateKey;
      headers["Authorization"] = `Bearer ${privateKey}`;
    }

    const response = await fetch("https://kyc-api.surepass.app/api/v1/rc/rc-v2", {
      method: "POST",
      headers,
      body: JSON.stringify({
        id_number: formattedId,
        enrich: true
      })
    });

    const data = await response.json();

    if (response.ok && data.success !== false) {
      return data;
    }
    
    return { error: data.message || "Failed to retrieve vehicle details from Surepass API." };
  } catch (error: any) {
    console.error("Vehicle lookup error:", error);
    return { error: error.message || "Internal server error while fetching vehicle data" };
  }
}
