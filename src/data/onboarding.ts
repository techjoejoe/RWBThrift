/** 20-day GM onboarding curriculum */

export interface OnboardingTask {
    id: string;
    title: string;
    requiresSignOff: boolean;
    passport?: string;
}

export interface OnboardingDay {
    day: number;
    title: string;
    tasks: OnboardingTask[];
}

export interface OnboardingWeek {
    week: number;
    title: string;
    days: OnboardingDay[];
}

export const weeks: OnboardingWeek[] = [
    {
        week: 1, title: 'Retail Operations & Front End', days: [
            {
                day: 1, title: 'Welcome & Orientation', tasks: [
                    { id: 'w1d1-1', title: 'Welcome — meet team, managers, supervisors', requiresSignOff: false },
                    { id: 'w1d1-2', title: 'Complete onboarding including I-9', requiresSignOff: false },
                    { id: 'w1d1-3', title: 'Training overview — review training plan with manager', requiresSignOff: false },
                    { id: 'w1d1-4', title: 'Intro store walk with management', requiresSignOff: false },
                    { id: 'w1d1-5', title: 'Scheduling — Production & Retail Scheduling Tools', requiresSignOff: false },
                    { id: 'w1d1-6', title: 'Complete People Passport: Tech Essentials', requiresSignOff: true, passport: 'Tech Essentials' },
                    { id: 'w1d1-7', title: 'High-level review of store applications', requiresSignOff: false },
                ]
            },
            {
                day: 2, title: 'Register & Cash Operations', tasks: [
                    { id: 'w1d2-1', title: 'Review store opening procedures', requiresSignOff: false },
                    { id: 'w1d2-2', title: 'Shadow Retail Manager, review daily priorities', requiresSignOff: false },
                    { id: 'w1d2-3', title: 'Register operations — build a till, run register all day', requiresSignOff: false },
                    { id: 'w1d2-4', title: 'Safe drop, change order, armored car procedures', requiresSignOff: false },
                    { id: 'w1d2-5', title: 'Complete People Passport: I-9 Compliance', requiresSignOff: true, passport: 'I-9 Compliance' },
                ]
            },
            {
                day: 3, title: 'Retail Floor & Closing', tasks: [
                    { id: 'w1d3-1', title: 'Digital sign overview — Color Tag Sale slides', requiresSignOff: false },
                    { id: 'w1d3-2', title: 'Retail sales floor — recovery, merchandising, signage', requiresSignOff: false },
                    { id: 'w1d3-3', title: 'Review closing procedures', requiresSignOff: false },
                    { id: 'w1d3-4', title: 'Review RM Call Slides', requiresSignOff: false },
                ]
            },
            {
                day: 4, title: 'Supervisor Shadow & Scheduling', tasks: [
                    { id: 'w1d4-1', title: 'Shadow Retail Supervisor — run front end/sales floor', requiresSignOff: false },
                    { id: 'w1d4-2', title: 'Scheduling — complete Dayforce training module', requiresSignOff: false },
                    { id: 'w1d4-3', title: 'Complete People Passport: HR Essentials', requiresSignOff: true, passport: 'HR Essentials' },
                ]
            },
            {
                day: 5, title: 'Week 1 Wrap-Up & Certification', tasks: [
                    { id: 'w1d5-1', title: 'Morning floor walk — review results, create plan', requiresSignOff: false },
                    { id: 'w1d5-2', title: 'Shadow Retail Manager — interviewing, metrics, KPIs', requiresSignOff: false },
                    { id: 'w1d5-3', title: 'Review Retail Manager Guided Work', requiresSignOff: false },
                    { id: 'w1d5-4', title: 'Passport Certification: Tech, I-9, HR Essentials', requiresSignOff: true, passport: 'Week 1 Certification' },
                    { id: 'w1d5-5', title: 'End of Week Touchbase & signatures', requiresSignOff: true },
                ]
            },
        ],
    },
    {
        week: 2, title: 'Production, LP & Supply Chain', days: [
            {
                day: 6, title: 'Supply Chain & Recycling', tasks: [
                    { id: 'w2d6-1', title: 'Truck unloading with Transportation Supervisor', requiresSignOff: false },
                    { id: 'w2d6-2', title: 'Shadow driver on truck route', requiresSignOff: false },
                    { id: 'w2d6-3', title: 'Teams call with Supply Chain', requiresSignOff: false },
                    { id: 'w2d6-4', title: 'Watch videos: Intro, Baler, Recycling', requiresSignOff: false },
                    { id: 'w2d6-5', title: 'Trash, Recycling & Storage overview', requiresSignOff: false },
                ]
            },
            {
                day: 7, title: 'Production Routine & Misc', tasks: [
                    { id: 'w2d7-1', title: 'Support daily production routine', requiresSignOff: false },
                    { id: 'w2d7-2', title: 'Miscellaneous department — all roles', requiresSignOff: false },
                    { id: 'w2d7-3', title: 'Complete People Passport: Safety & Risk', requiresSignOff: true, passport: 'Safety & Risk' },
                ]
            },
            {
                day: 8, title: 'Furniture & Electronics', tasks: [
                    { id: 'w2d8-1', title: 'Digital sign update', requiresSignOff: false },
                    { id: 'w2d8-2', title: 'Furniture and Electronics departments', requiresSignOff: false },
                    { id: 'w2d8-3', title: 'Complete People Passport: Loss Prevention', requiresSignOff: true, passport: 'Loss Prevention' },
                ]
            },
            {
                day: 9, title: 'Books & LP Standards', tasks: [
                    { id: 'w2d9-1', title: 'Books department — full workflow', requiresSignOff: false },
                    { id: 'w2d9-2', title: 'Review safety and LP standards', requiresSignOff: false },
                    { id: 'w2d9-3', title: 'Teams call with Dan Kober (LP)', requiresSignOff: false },
                ]
            },
            {
                day: 10, title: 'Week 2 Wrap-Up & Certification', tasks: [
                    { id: 'w2d10-1', title: 'Jewelry production — full workflow', requiresSignOff: false },
                    { id: 'w2d10-2', title: 'Passport Certification: Safety & Risk, LP', requiresSignOff: true, passport: 'Week 2 Certification' },
                    { id: 'w2d10-3', title: 'End of Week Touchbase & signatures', requiresSignOff: true },
                ]
            },
        ],
    },
    {
        week: 3, title: 'Advanced Production & Supervision', days: [
            {
                day: 11, title: 'Soft Table Production', tasks: [
                    { id: 'w3d11-1', title: 'Soft table production — all roles', requiresSignOff: false },
                    { id: 'w3d11-2', title: 'Complete People Passport: Recruiting', requiresSignOff: true, passport: 'Recruiting' },
                ]
            },
            {
                day: 12, title: 'Pricing & Ragout', tasks: [
                    { id: 'w3d12-1', title: 'Ragout & recovery — all roles', requiresSignOff: false },
                    { id: 'w3d12-2', title: 'Clothing pricing — 10 sec/item goal', requiresSignOff: false },
                ]
            },
            {
                day: 13, title: 'Linens, Shoes & Accessories', tasks: [
                    { id: 'w3d13-1', title: 'Linens, Shoes & Accessories departments', requiresSignOff: false },
                    { id: 'w3d13-2', title: 'Complete People Passport: Employee Relations', requiresSignOff: true, passport: 'Employee Relations' },
                ]
            },
            {
                day: 14, title: 'Production Supervision', tasks: [
                    { id: 'w3d14-1', title: 'Soft department supervision', requiresSignOff: false },
                    { id: 'w3d14-2', title: 'Hard department supervision', requiresSignOff: false },
                ]
            },
            {
                day: 15, title: 'Week 3 Wrap-Up & Certification', tasks: [
                    { id: 'w3d15-1', title: 'Production Manager training & shadow', requiresSignOff: false },
                    { id: 'w3d15-2', title: 'Passport Certification: Recruiting, Employee Relations, Reasonable Suspicion', requiresSignOff: true, passport: 'Week 3 Certification' },
                    { id: 'w3d15-3', title: 'End of Week Touchbase & signatures', requiresSignOff: true },
                ]
            },
        ],
    },
    {
        week: 4, title: 'Store Leadership & Readiness', days: [
            {
                day: 16, title: 'Store Manager Operations & HR', tasks: [
                    { id: 'w4d16-1', title: 'Store Manager operations — reports, Dayforce, standards', requiresSignOff: false },
                    { id: 'w4d16-2', title: 'HR Training: Performance Management & HR Q&A', requiresSignOff: false },
                ]
            },
            {
                day: 17, title: 'GM Shadow & HR Support', tasks: [
                    { id: 'w4d17-1', title: 'Shadow GM all day', requiresSignOff: false },
                    { id: 'w4d17-2', title: 'HR Support call with Tara McGrady', requiresSignOff: false },
                    { id: 'w4d17-3', title: 'Complete People Passport: Payroll & Timekeeping', requiresSignOff: true, passport: 'Payroll & Timekeeping' },
                ]
            },
            {
                day: 18, title: 'GM Shadow & Partnerships', tasks: [
                    { id: 'w4d18-1', title: 'Shadow GM all day', requiresSignOff: false },
                    { id: 'w4d18-2', title: 'Teams call with Claims (Britney Spyker)', requiresSignOff: false },
                    { id: 'w4d18-3', title: 'Teams call with Marketing', requiresSignOff: false },
                ]
            },
            {
                day: 19, title: 'ACTING STORE MANAGER', tasks: [
                    { id: 'w4d19-1', title: '🏆 ACTING STORE MANAGER — oversee ALL operations ALL day', requiresSignOff: true },
                    { id: 'w4d19-2', title: 'Complete People Passport: FMLA, Leaves & Accommodations', requiresSignOff: true, passport: 'FMLA/Leaves' },
                ]
            },
            {
                day: 20, title: 'FINAL CERTIFICATION', tasks: [
                    { id: 'w4d20-1', title: 'Store Operations Skill Check', requiresSignOff: true },
                    { id: 'w4d20-2', title: 'P&L Overview & Power BI Training', requiresSignOff: false },
                    { id: 'w4d20-3', title: 'Passport Certification: Payroll, Harassment, FMLA', requiresSignOff: true, passport: 'Week 4 Certification' },
                    { id: 'w4d20-4', title: '🎓 FINAL CERTIFICATION — Certified to operate independently', requiresSignOff: true },
                ]
            },
        ],
    },
];
