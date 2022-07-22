const crypto = require("crypto");
const algorithem = "aes-256-cbc";
const Securitykey = process.env.PUBLISHER_API_SECRET_KEY || "secret_key";

function generateHashToken(payload) {
    // let data = `${payload} ${Math.floor(Math.random() * 1000)}`;
    let data = `${payload} ${Date.now()}`;
    let cipher = crypto.createCipher(algorithem, Securitykey);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

function decrypthashToken(encryptedKey) {
    try {
        let decipher = crypto.createDecipher(algorithem, Securitykey);
        let decrypted = decipher.update(encryptedKey, "hex", "utf8");
        decrypted += decipher.final("utf8");
        decrypted = decrypted.split(" ")
        return decrypted[0];
    } catch (error) {
        throw new Error("Valid api_key/token is required");
    }
}

module.exports = {
    generateHashToken,
    decrypthashToken,
};
