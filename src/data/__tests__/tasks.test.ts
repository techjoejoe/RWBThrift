import { describe, it, expect } from 'vitest';
import { dailyTasks, weeklyTasks, monthlyTasks, TaskDefinition } from '@/data/tasks';

describe('Task Data Integrity', () => {
    const allTasks = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];

    it('has no duplicate task IDs across all task sets', () => {
        const ids = allTasks.map(t => t.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('every task has a title and description', () => {
        allTasks.forEach(task => {
            expect(task.title, `Task ${task.id} missing title`).toBeTruthy();
            expect(task.description, `Task ${task.id} missing description`).toBeTruthy();
        });
    });

    it('every task has an estimatedMinutes value > 0 when defined', () => {
        const withEstimate = allTasks.filter(t => t.estimatedMinutes !== undefined);
        expect(withEstimate.length).toBeGreaterThan(0);
        withEstimate.forEach(task => {
            expect(task.estimatedMinutes, `Task ${task.id} has invalid estimatedMinutes`).toBeGreaterThan(0);
        });
    });

    it('every task has a subTasks array', () => {
        allTasks.forEach(task => {
            expect(Array.isArray(task.subTasks), `Task ${task.id} subTasks is not an array`).toBe(true);
        });
    });

    it('every task has a resourceLinks array', () => {
        allTasks.forEach(task => {
            expect(Array.isArray(task.resourceLinks), `Task ${task.id} resourceLinks is not an array`).toBe(true);
        });
    });

    it('daily tasks have time windows', () => {
        const validWindows = ['morning', 'midday', 'afternoon', 'close'];
        dailyTasks.forEach(task => {
            expect(validWindows, `Task ${task.id} has invalid timeWindow: ${task.timeWindow}`)
                .toContain(task.timeWindow);
        });
    });

    it('has daily tasks', () => {
        expect(dailyTasks.length).toBeGreaterThan(0);
    });

    it('has weekly tasks', () => {
        expect(weeklyTasks.length).toBeGreaterThan(0);
    });

    it('has monthly tasks', () => {
        expect(monthlyTasks.length).toBeGreaterThan(0);
    });

    it('sub-task IDs are unique within each task', () => {
        allTasks.forEach(task => {
            if (task.subTasks.length > 0) {
                const subIds = task.subTasks.map(st => st.id);
                const uniqueSubIds = new Set(subIds);
                expect(uniqueSubIds.size, `Task ${task.id} has duplicate sub-task IDs`).toBe(subIds.length);
            }
        });
    });
});
