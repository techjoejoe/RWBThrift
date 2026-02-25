import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DistrictDoc {
    id: string;
    name: string;
    dmUid?: string;
    createdAt: string;
}

/** Fetch all districts, sorted alphabetically */
export async function getDistricts(): Promise<DistrictDoc[]> {
    const snap = await getDocs(collection(db, 'districts'));
    const list: DistrictDoc[] = [];
    snap.forEach(d => {
        const data = d.data();
        list.push({ id: d.id, name: data.name, dmUid: data.dmUid, createdAt: data.createdAt });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
}

/** Create a new district */
export async function createDistrict(name: string): Promise<DistrictDoc> {
    const id = `district-${Date.now()}`;
    const district: DistrictDoc = { id, name: name.trim(), createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'districts', id), { name: district.name, createdAt: district.createdAt });
    return district;
}

/** Delete a district and unassign all stores in it */
export async function deleteDistrict(id: string, storeIds: string[]): Promise<void> {
    // Unassign stores first
    for (const storeId of storeIds) {
        await updateDoc(doc(db, 'stores', storeId), { districtId: null });
    }
    await deleteDoc(doc(db, 'districts', id));
}

/** Assign a DM to a district (or unassign with null) */
export async function assignDM(districtId: string, dmUid: string | null): Promise<void> {
    await updateDoc(doc(db, 'districts', districtId), { dmUid: dmUid || null });
}
