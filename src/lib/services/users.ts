import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AppUser {
    uid: string;
    name: string;
    email: string;
    role: string;
    store: string;
    storeId?: string;
    createdAt?: string;
}

/** Fetch all users, sorted alphabetically by name */
export async function getUsers(): Promise<AppUser[]> {
    const snap = await getDocs(collection(db, 'users'));
    const list: AppUser[] = [];
    snap.forEach(d => {
        const data = d.data();
        list.push({
            uid: d.id,
            name: data.name || 'Unknown',
            email: data.email || '',
            role: data.role || 'gm',
            store: data.store || '',
            storeId: data.storeId,
            createdAt: data.createdAt,
        });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
}

/** Change a user's role */
export async function changeUserRole(uid: string, newRole: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { role: newRole });
}
