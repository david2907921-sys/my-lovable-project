
const DB_NAME = 'SanctuaryCache';
const STORE_NAME = 'configs';
const DB_VERSION = 1;

export const cacheService = {
  async getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // Timeout für das Öffnen der DB
      const timeout = setTimeout(() => reject(new Error("IDB Open Timeout")), 3000);
      
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => {
          clearTimeout(timeout);
          reject(request.error);
        };
        request.onsuccess = () => {
          clearTimeout(timeout);
          resolve(request.result);
        };
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
      } catch (e) {
        clearTimeout(timeout);
        reject(e);
      }
    });
  },

  async set(key: string, value: any): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ 
          data: value, 
          timestamp: Date.now() 
        }, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        
        // Safety: Falls die Transaktion hängen bleibt
        setTimeout(() => reject(new Error("Transaction Timeout")), 2000);
      });
    } catch (e) {
      console.warn("IndexedDB Write failed", e);
    }
  },

  async get(key: string): Promise<any | null> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
        
        // Safety
        setTimeout(() => resolve(null), 2000);
      });
    } catch (e) {
      console.warn("IndexedDB Read failed", e);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn("IndexedDB Delete failed", e);
    }
  }
};
