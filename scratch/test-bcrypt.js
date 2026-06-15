const bcrypt = require("bcryptjs");
const hash = "$2b$10$1aDlzbb6w1aLfAHOuJwVTuxYYoKJQpXDu/S.VvxDZk.NM71R8ysDe";
const input = "dspn8p2149";

async function run() {
    const res = await bcrypt.compare(input, hash);
    console.log("Input:", input);
    console.log("Hash:", hash);
    console.log("Direct compare result:", res);
}
run();
