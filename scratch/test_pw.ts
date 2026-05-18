import bcrypt from 'bcryptjs';

const hash = "$2b$10$9v/TpBE8mT5RDu4hf4Jix.ho0xrTHPDNbiTO4doV.iNvmUwpOiZTi";

async function check() {
    const isMatch = await bcrypt.compare("xyz", hash);
    console.log("Password 'xyz' matches hash?", isMatch);
}
check();
