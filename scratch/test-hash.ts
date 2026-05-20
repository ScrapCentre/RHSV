import bcrypt from "bcryptjs";

const hash = "$2b$12$yNmNsVORP/zTKmpl1zuSpeHWUdUh3aT.3XdIMUvHkXAdBErlrrJjq";
const candidatePasswords = [
  "sc01",
  "verifya",
  "verified",
  "sc01@gmail.com",
  "admin",
  "1234",
  "password",
  "scrapcentre",
  "scrapcentre@789",
  "verify",
  "sc01sc01",
  "warehouse",
  "warehouse sc01",
];

async function run() {
  for (const pw of candidatePasswords) {
    const match = await bcrypt.compare(pw, hash);
    console.log(`Password: "${pw}" -> ${match ? "MATCH!" : "no match"}`);
  }
}
run();
