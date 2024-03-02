import forge from "node-forge";

export function encodeWithPublicKey(message: string, publicKey: string): string {
    // Create a public key object
    const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);

    // Encode (encrypt) the message using RSA-OAEP algorithm
    const encrypted = rsaPublicKey.encrypt(message, "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create(),
        },
    });

    // Convert the encrypted bytes to Base64 string
    return forge.util.encode64(encrypted);
}

export function decodeWithPrivateKey(encodedMessage: string, privateKey: string): string {
    // Create a private key object
    const rsaPrivateKey = forge.pki.privateKeyFromPem(privateKey);

    // Decode (decrypt) the Base64-encoded message using RSA-OAEP algorithm
    const decoded = rsaPrivateKey.decrypt(forge.util.decode64(encodedMessage), "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create(),
        },
    });

    return decoded;
}
