import type { ArticleSnapshot } from './readingTypes.ts';

const DATABASE_NAME = 'survive-hfut-reading';
const DATABASE_VERSION = 1;
const SNAPSHOT_STORE = 'articleSnapshots';

export interface SnapshotReadResult {
  available: boolean;
  snapshot: ArticleSnapshot | null;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SNAPSHOT_STORE)) {
        database.createObjectStore(SNAPSHOT_STORE, { keyPath: 'path' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB is blocked'));
  });
}

async function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();

  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(SNAPSHOT_STORE, mode);
      const request = operation(transaction.objectStore(SNAPSHOT_STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function readArticleSnapshot(
  path: string,
): Promise<SnapshotReadResult> {
  try {
    const snapshot = await runTransaction<ArticleSnapshot | undefined>(
      'readonly',
      (store) => store.get(path),
    );
    return { available: true, snapshot: snapshot ?? null };
  } catch {
    return { available: false, snapshot: null };
  }
}

export async function saveArticleSnapshot(
  snapshot: ArticleSnapshot,
): Promise<boolean> {
  try {
    await runTransaction<IDBValidKey>('readwrite', (store) =>
      store.put(snapshot),
    );
    return true;
  } catch {
    return false;
  }
}

export async function deleteArticleSnapshot(path: string): Promise<boolean> {
  try {
    await runTransaction<undefined>('readwrite', (store) => store.delete(path));
    return true;
  } catch {
    return false;
  }
}
