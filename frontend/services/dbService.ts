const DB_NAME = 'VaultVoiceDB';
const STORE_NAME = 'caseKeys';
const DB_VERSION = 1;

let db: IDBDatabase;

function getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject("Error opening IndexedDB.");
        
        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
            }
        };
    });
}

export const dbService = {
    saveEncryptedCaseKey: async (sessionId: string, encryptedKeyData: { encryptedKeyBase64: string; saltBase64: string, nonceBase64: string }): Promise<void> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ sessionId, ...encryptedKeyData });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject('Failed to save key.');
        });
    },

    getEncryptedCaseKey: async (sessionId: string): Promise<{ encryptedKeyBase64: string; saltBase64: string, nonceBase64: string } | null> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(sessionId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject('Failed to retrieve key.');
        });
    },
};