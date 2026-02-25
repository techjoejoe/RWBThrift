import { TimeWindow } from '@/data/tasks';

/** Returns the current time window based on local hour */
export function getCurrentTimeWindow(): TimeWindow {
    const hour = new Date().getHours();
    if (hour < 10) return 'morning';
    if (hour < 14) return 'midday';
    if (hour < 17) return 'afternoon';
    return 'close';
}

/** Human-readable label with emoji for a time window */
export function getTimeWindowLabel(tw: TimeWindow): string {
    switch (tw) {
        case 'morning': return '☀️ Morning';
        case 'midday': return '🌤️ Midday';
        case 'afternoon': return '🌅 Afternoon';
        case 'close': return '🌙 Closing';
    }
}
