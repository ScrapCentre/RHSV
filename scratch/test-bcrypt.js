const bcrypt = require("bcryptjs");

async function check() {
    const pw = "scrapcentre@789";
    const hash = "$2b$10$.jHNuz3XurA5ZfG/ZZPavuuqiFpHi21dgTQcis4dMzCqCCw1vfRoy";
    const result = await bcrypt.compare(pw, hash);
    console.log("Password matches hash:", result);
}
check();
