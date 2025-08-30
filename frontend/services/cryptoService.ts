
// Helper functions for conversions
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Crypto operations
export const cryptoService = {
    generateAesKey: async (): Promise<CryptoKey> => {
        return window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },

    exportKey: async (key: CryptoKey): Promise<string> => {
        const exported = await window.crypto.subtle.exportKey('raw', key);
        return arrayBufferToBase64(exported);
    },

    importKey: async (keyData: string): Promise<CryptoKey> => {
        const buffer = base64ToArrayBuffer(keyData);
        return window.crypto.subtle.importKey(
            'raw',
            buffer,
            { name: 'AES-GCM' },
            true,
            ['encrypt', 'decrypt']
        );
    },

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

    encryptWithRsaPublicKey: async (data: ArrayBuffer, publicKeyPem: string): Promise<ArrayBuffer> => {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = publicKeyPem.substring(pemHeader.length, publicKeyPem.length - pemFooter.length).replace(/\s/g, '');
        const binaryDer = base64ToArrayBuffer(pemContents);

        const publicKey = await window.crypto.subtle.importKey(
            'spki',
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );

        return window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            data
        );
    },

    arrayBufferToBase64,
    base64ToArrayBuffer,
    textEncoder,
    textDecoder,
};
