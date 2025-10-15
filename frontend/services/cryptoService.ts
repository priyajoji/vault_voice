// Helper functions for conversions
/**
 * Converts a Base64 string into a raw ArrayBuffer.
 * This is used for decoding raw key data exported from Web Crypto.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    // 1. Decode the Base64 string into a "binary string" (Latin-1/ASCII)
    const binaryString = window.atob(base64); 
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    // 2. Convert each character's code point (0-255) into a byte
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Converts a raw ArrayBuffer (like an exported CryptoKey) into a Base64 string.
 * This is the corrected function using an efficient, standard pattern.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    
    // 1. Convert the Uint8Array into a single "binary string" (Latin-1/ASCII).
    // The String.fromCharCode.apply pattern is the fastest method for this in browsers.
    const binaryString = String.fromCharCode.apply(null, bytes as any); // 'as any' resolves TypeScript arguments issue
    
    // 2. Encode the binary string to Base64
    return window.btoa(binaryString);
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Crypto operations
export const cryptoService = {
    // Key Management
    // ------------------------------------------------------------------------------------------------------------------
    generateAesKey: async (): Promise<CryptoKey> => {
        return window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },

    exportKey: async (key: CryptoKey): Promise<string> => {
        const exported = await window.crypto.subtle.exportKey('raw', key);
        // Corrected function usage here
        return arrayBufferToBase64(exported);
    },

    importKey: async (keyData: string): Promise<CryptoKey> => {
        // Corrected function usage here
        const buffer = base64ToArrayBuffer(keyData);
        return window.crypto.subtle.importKey(
            'raw',
            buffer,
            { name: 'AES-GCM' },
            true,
            ['encrypt', 'decrypt']
        );
    },
    generateRsaKeyPair: async (): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> => {
        return window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048, 
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: "SHA-256",
            },
            true, // Key is extractable
            ["encrypt", "decrypt"]
        );
    },
    exportPublicKeyToPem: async (publicKey: CryptoKey): Promise<string> => {
        const exported = await window.crypto.subtle.exportKey("spki", publicKey);
        const base64Key = arrayBufferToBase64(exported);
        
        // Format as a PEM string with line breaks
        let pem = "-----BEGIN PUBLIC KEY-----\n";
        for (let i = 0; i < base64Key.length; i += 64) {
            pem += base64Key.substring(i, i + 64) + "\n";
        }
        pem += "-----END PUBLIC KEY-----\n";
        return pem;
    },

    // Password Key Derivation
    // ------------------------------------------------------------------------------------------------------------------
    deriveKeyFromPassword: async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
        const masterKey = await window.crypto.subtle.importKey(
            'raw',
            textEncoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 150000,
                hash: 'SHA-256',
            },
            masterKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },

    // AES-GCM Encryption/Decryption
    // ------------------------------------------------------------------------------------------------------------------
    encryptAesGcm: async (data: string | ArrayBuffer, key: CryptoKey): Promise<{ ciphertext: ArrayBuffer; nonce: Uint8Array }> => {
        const nonce = window.crypto.getRandomValues(new Uint8Array(12));
        const dataBuffer = typeof data === 'string' ? textEncoder.encode(data) : data;

        const ciphertext = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: nonce },
            key,
            dataBuffer
        );

        return { ciphertext, nonce };
    },

    decryptAesGcm: async (ciphertext: ArrayBuffer, nonce: Uint8Array, key: CryptoKey): Promise<ArrayBuffer> => {
        return window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: nonce },
            key,
            ciphertext
        );
    },

    // RSA-OAEP Encryption
    // ------------------------------------------------------------------------------------------------------------------
    encryptWithRsaPublicKey: async (data: ArrayBuffer, publicKeyPem: string): Promise<ArrayBuffer> => {
        if (!publicKeyPem) throw new Error("Public key PEM is empty");

        // Clean the PEM string (remove headers, footers, and invalid characters)
        let pemContents = publicKeyPem
            .replace(/-----BEGIN PUBLIC KEY-----/, "")
            .replace(/-----END PUBLIC KEY-----/, "")
            .replace(/[^A-Za-z0-9+/=]/g, "");

        // Add padding if missing
        pemContents = pemContents.padEnd(pemContents.length + (4 - (pemContents.length % 4)) % 4, "=");

        // Convert to ArrayBuffer
        const binaryDer = base64ToArrayBuffer(pemContents);

        // Import the RSA public key
        const publicKey = await window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );

        // Encrypt the data
        return window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
    },

    // Re-export helper functions
    // ------------------------------------------------------------------------------------------------------------------
    arrayBufferToBase64,
    base64ToArrayBuffer,
    textEncoder,
    textDecoder,
};
