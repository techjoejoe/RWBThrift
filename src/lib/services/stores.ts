import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface StoreDoc {
    id: string;
    name: string;
    districtId?: string;
    createdAt: string;
}

/** Fetch all stores, sorted alphabetically */
export async function getStores(): Promise<StoreDoc[]> {
    const snap = await getDocs(collection(db, 'stores'));
    const list: StoreDoc[] = [];
    snap.forEach(d => {
        const data = d.data();
        list.push({ id: d.id, name: data.name, districtId: data.districtId, createdAt: data.createdAt });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
}

/** Create a new store */
export async function createStore(name: string): Promise<StoreDoc> {
    const id = `store-${Date.now()}`;
    const store: StoreDoc = { id, name: name.trim(), createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'stores', id), { name: store.name, createdAt: store.createdAt });
    return store;
}

/** Delete a store by ID */
export async function deleteStore(id: string): Promise<void> {
    await deleteDoc(doc(db, 'stores', id));
}

/** Assign a store to a district (or unassign with null) */
export async function assignStoreToDistrict(storeId: string, districtId: string | null): Promise<void> {
    await updateDoc(doc(db, 'stores', storeId), { districtId: districtId || null });
}
