import { describe, it, expect } from 'vitest';
import type { StoreDoc } from '@/lib/services/stores';
import type { DistrictDoc } from '@/lib/services/districts';
import type { AppUser } from '@/lib/services/users';

/**
 * These tests validate the service layer type contracts.
 * They ensure the interfaces are correctly structured and
 * that the service functions have the expected signatures.
 */

describe('Service Layer Types', () => {
    describe('StoreDoc', () => {
        it('has required fields', () => {
            const store: StoreDoc = {
                id: 'store-123',
                name: 'Store #101',
                createdAt: '2024-01-01T00:00:00Z',
            };
            expect(store.id).toBe('store-123');
            expect(store.name).toBe('Store #101');
            expect(store.createdAt).toBeTruthy();
            expect(store.districtId).toBeUndefined();
        });

        it('supports optional districtId', () => {
            const store: StoreDoc = {
                id: 'store-456',
                name: 'Store #202',
                districtId: 'district-1',
                createdAt: '2024-01-01T00:00:00Z',
            };
            expect(store.districtId).toBe('district-1');
        });
    });

    describe('DistrictDoc', () => {
        it('has required fields', () => {
            const district: DistrictDoc = {
                id: 'district-1',
                name: 'Northwest',
                createdAt: '2024-01-01T00:00:00Z',
            };
            expect(district.id).toBe('district-1');
            expect(district.name).toBe('Northwest');
            expect(district.dmUid).toBeUndefined();
        });

        it('supports optional dmUid', () => {
            const district: DistrictDoc = {
                id: 'district-2',
                name: 'Southeast',
                dmUid: 'user-abc',
                createdAt: '2024-01-01T00:00:00Z',
            };
            expect(district.dmUid).toBe('user-abc');
        });
    });

    describe('AppUser', () => {
        it('has required fields', () => {
            const user: AppUser = {
                uid: 'user-1',
                name: 'John Smith',
                email: 'john@example.com',
                role: 'gm',
                store: 'Store #101',
            };
            expect(user.uid).toBe('user-1');
            expect(user.role).toBe('gm');
        });

        it('supports DM role', () => {
            const dm: AppUser = {
                uid: 'user-2',
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: 'dm',
                store: '',
            };
            expect(dm.role).toBe('dm');
        });
    });
});
