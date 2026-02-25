export interface SubTask {
  id: string;
  title: string;
}

export interface ResourceLink {
  label: string;
  url: string;
}

export type TimeWindow = 'morning' | 'midday' | 'afternoon' | 'close';

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  subTasks: SubTask[];
  tips: string;
  resourceLinks: ResourceLink[];
  category: 'daily' | 'weekly' | 'monthly';
  timeWindow?: TimeWindow;
  /** Flag: this task is a great candidate for delegation */
  recommendDelegate?: boolean;
  /** Estimated minutes this task takes */
  estimatedMinutes?: number;
}

export const dailyTasks: TaskDefinition[] = [
  {
    id: 'daily-1',
    title: 'Morning Floor Walk',
    description: 'Review overnight results, walk the floor, observe store condition. Set the tone for the day.',
    subTasks: [
      { id: 'daily-1-1', title: 'Review overnight sales results' },
      { id: 'daily-1-2', title: 'Walk the entire sales floor' },
      { id: 'daily-1-3', title: 'Observe store cleanliness and condition' },
      { id: 'daily-1-4', title: 'Note any issues for team huddle' },
    ],
    tips: 'Start your walk from the customer entrance. See your store through the customer\'s eyes. Take quick notes on your phone.',
    resourceLinks: [
      { label: 'Power BI Reports', url: 'https://app.powerbi.com' },
    ],
    category: 'daily',
    timeWindow: 'morning',
    estimatedMinutes: 20,
  },
  {
    id: 'daily-2',
    title: 'Review Business Reports',
    description: 'Check Power BI for sales, production, and labor reporting.',
    subTasks: [
      { id: 'daily-2-1', title: 'Check yesterday\'s sales numbers' },
      { id: 'daily-2-2', title: 'Review production output' },
      { id: 'daily-2-3', title: 'Check labor vs. forecast' },
    ],
    tips: 'Compare today\'s numbers to the same day last week. Look for trends, not just single data points.',
    resourceLinks: [
      { label: 'Power BI', url: 'https://app.powerbi.com' },
    ],
    category: 'daily',
    timeWindow: 'morning',
    estimatedMinutes: 15,
  },
  {
    id: 'daily-3',
    title: 'Team Huddle',
    description: 'Lead morning huddle with production and retail teams. Set daily priorities, assignments, and accountability.',
    subTasks: [
      { id: 'daily-3-1', title: 'Share yesterday\'s results' },
      { id: 'daily-3-2', title: 'Set today\'s priorities and goals' },
      { id: 'daily-3-3', title: 'Assign responsibilities' },
      { id: 'daily-3-4', title: 'Address any questions or concerns' },
    ],
    tips: 'Keep huddles to 10-15 minutes. Be energetic and positive. End with clear assignments for everyone.',
    resourceLinks: [],
    category: 'daily',
    timeWindow: 'morning',
    estimatedMinutes: 15,
  },
  {
    id: 'daily-4',
    title: 'Rag Out Planning',
    description: 'Review and update the Rag Out plan with production team. Ensure execution, rack checking, and follow-up.',
    subTasks: [
      { id: 'daily-4-1', title: 'Review current Rag Out plan' },
      { id: 'daily-4-2', title: 'Update plan with production team' },
      { id: 'daily-4-3', title: 'Check rack status' },
      { id: 'daily-4-4', title: 'Follow up on any lagging areas' },
    ],
    tips: 'The Rag Out plan drives production flow. Make sure it is current and actively being executed every hour.',
    resourceLinks: [],
    category: 'daily',
    timeWindow: 'morning',
    recommendDelegate: true,
    estimatedMinutes: 15,
  },
  {
    id: 'daily-5',
    title: 'Retail Sales Floor Check',
    description: 'Verify recovery, merchandising standards, department signage, customer engagement.',
    subTasks: [
      { id: 'daily-5-1', title: 'Check recovery standards' },
      { id: 'daily-5-2', title: 'Verify merchandising displays' },
      { id: 'daily-5-3', title: 'Confirm department signage is correct' },
      { id: 'daily-5-4', title: 'Observe customer engagement on floor' },
    ],
    tips: 'Your sales floor IS your revenue generator. Keep it shoppable, organized, and inviting at all times.',
    resourceLinks: [],
    category: 'daily',
    timeWindow: 'midday',
    recommendDelegate: true,
    estimatedMinutes: 15,
  },
  {
    id: 'daily-6',
    title: 'Cashier / Front End Monitoring',
    description: 'Ensure proper cashier-to-customer ratio (3 baskets to 1 cashier = open another register). Verify register operations running smoothly.',
    subTasks: [
      { id: 'daily-6-1', title: 'Check cashier-to-customer ratio' },
      { id: 'daily-6-2', title: 'Verify registers operational' },
      { id: 'daily-6-3', title: 'Observe cashier customer interactions' },
    ],
    tips: 'The 3:1 basket-to-cashier rule is critical. If you see 3 customers with baskets waiting, open another register immediately.',
    resourceLinks: [],
    category: 'daily',
    timeWindow: 'midday',
    recommendDelegate: true,
    estimatedMinutes: 10,
  },
  {
    id: 'daily-7',
    title: 'Manager Coverage Check',
    description: 'Confirm the right leader is in the right place at the right time (MOD coverage, proper delegation).',
    subTasks: [
      { id: 'daily-7-1', title: 'Confirm MOD coverage for all shifts' },
      { id: 'daily-7-2', title: 'Verify delegation assignments' },
      { id: 'daily-7-3', title: 'Check manager positioning on floor' },
    ],
    tips: '"Right leader, right place, right time." Don\'t get pulled into tasks you should be delegating.',
    resourceLinks: [],
    category: 'daily',
    timeWindow: 'midday',
    estimatedMinutes: 10,
  },
  {
    id: 'daily-8',
    title: 'Dayforce Timekeeping',
    description: 'Review and approve timekeeping, address exceptions.',
    subTasks: [
      { id: 'daily-8-1', title: 'Review timecard exceptions' },
      { id: 'daily-8-2', title: 'Approve pending timecards' },
      { id: 'daily-8-3', title: 'Address any discrepancies' },
    ],
    tips: 'Process exceptions daily — don\'t let them pile up to the end of the pay period.',
    resourceLinks: [
      { label: 'Dayforce', url: 'https://www.dayforcehcm.com/' },
    ],
    category: 'daily',
    timeWindow: 'afternoon',
    recommendDelegate: true,
    estimatedMinutes: 10,
  },
  {
    id: 'daily-9',
    title: 'Till / Cash Management',
    description: 'Verify till drops, safe procedures, change orders, deposit documentation (all under camera).',
    subTasks: [
      { id: 'daily-9-1', title: 'Verify till drops completed' },
      { id: 'daily-9-2', title: 'Check safe procedures followed' },
      { id: 'daily-9-3', title: 'Review change order needs' },
      { id: 'daily-9-4', title: 'Confirm deposits documented under camera' },
    ],
    tips: 'Every cash transaction must be under camera. No exceptions. This protects you and your team.',
    resourceLinks: [],
    category: 'daily',
    timeWindow: 'afternoon',
    estimatedMinutes: 10,
  },
  {
    id: 'daily-10',
    title: 'Safety Walkthrough',
    description: 'Check for hazards, verify safety standards, review any incidents.',
    subTasks: [
      { id: 'daily-10-1', title: 'Walk floor checking for hazards' },
      { id: 'daily-10-2', title: 'Verify safety equipment accessible' },
      { id: 'daily-10-3', title: 'Review any incident reports' },
    ],
    tips: 'Look up, look down, look around. Common hazards: wet floors, blocked exits, overloaded carts, broken shelving.',
    resourceLinks: [
      { label: 'Origami (Incidents)', url: 'https://live.origamirisk.com/Origami/Account/Login' },
    ],
    category: 'daily',
    timeWindow: 'afternoon',
    recommendDelegate: true,
    estimatedMinutes: 15,
  },
  {
    id: 'daily-11',
    title: 'End of Day',
    description: 'Cash drawer closing, recovery at closing, close-to-open expectations, secure store.',
    subTasks: [
      { id: 'daily-11-1', title: 'Close all cash drawers and reconcile' },
      { id: 'daily-11-2', title: 'Ensure closing recovery completed' },
      { id: 'daily-11-3', title: 'Set close-to-open expectations' },
      { id: 'daily-11-4', title: 'Secure store' },
    ],
    tips: 'A strong close sets up a strong open. Leave clear notes for the opening team.',
    resourceLinks: [],
    category: 'daily',
    timeWindow: 'close',
    recommendDelegate: true,
    estimatedMinutes: 20,
  },
];

export const weeklyTasks: TaskDefinition[] = [
  {
    id: 'weekly-1',
    title: 'Build / Finalize Retail Schedule',
    description: 'Use scheduling tools and hourly demand data to ensure proper coverage matches customer traffic and sales by hour.',
    subTasks: [
      { id: 'weekly-1-1', title: 'Review hourly demand data' },
      { id: 'weekly-1-2', title: 'Build schedule matching traffic patterns' },
      { id: 'weekly-1-3', title: 'Verify labor budget alignment' },
    ],
    tips: 'Schedule to your demand curve, not a flat shift pattern. Peak hours need peak coverage.',
    resourceLinks: [
      { label: 'Dayforce', url: 'https://www.dayforcehcm.com/' },
    ],
    category: 'weekly',
  },
  {
    id: 'weekly-2',
    title: 'Build / Finalize Production Schedule',
    description: 'Use Production Scheduling Tool with PM to optimize production staffing.',
    subTasks: [
      { id: 'weekly-2-1', title: 'Meet with Production Manager' },
      { id: 'weekly-2-2', title: 'Use Production Scheduling Tool' },
      { id: 'weekly-2-3', title: 'Align production staffing with goals' },
    ],
    tips: 'Production drives retail inventory. A well-staffed production floor means a full sales floor.',
    resourceLinks: [],
    category: 'weekly',
  },
  {
    id: 'weekly-3',
    title: 'Weekly Business Review',
    description: 'Deep dive into Power BI reporting: sales trends, production output, labor vs. forecast.',
    subTasks: [
      { id: 'weekly-3-1', title: 'Review weekly sales vs. last year' },
      { id: 'weekly-3-2', title: 'Analyze production output trends' },
      { id: 'weekly-3-3', title: 'Compare labor spend to forecast' },
      { id: 'weekly-3-4', title: 'Identify action items' },
    ],
    tips: '"Lead the business, don\'t react to it." Use the data to plan next week, not just explain last week.',
    resourceLinks: [
      { label: 'Power BI', url: 'https://app.powerbi.com' },
    ],
    category: 'weekly',
  },
  {
    id: 'weekly-4',
    title: 'Team Touchbase Meetings',
    description: '1:1s with Retail Manager, Production Manager, Supervisors. Discuss key learnings, performance, development.',
    subTasks: [
      { id: 'weekly-4-1', title: '1:1 with Retail Manager' },
      { id: 'weekly-4-2', title: '1:1 with Production Manager' },
      { id: 'weekly-4-3', title: 'Touch base with Supervisors' },
    ],
    tips: 'Your managers are your force multipliers. Invest time in developing them. Ask: "What do you need from me?"',
    resourceLinks: [],
    category: 'weekly',
  },
  {
    id: 'weekly-5',
    title: 'Digital Sign Updates',
    description: 'Update Color Tag Sale slides (Wednesday and Sunday). Google Docs and Digital Sign Update Process.',
    subTasks: [
      { id: 'weekly-5-1', title: 'Update Color Tag Sale slides' },
      { id: 'weekly-5-2', title: 'Verify signs match current promotion' },
    ],
    tips: 'Update Wednesday and Sunday. Customers look for the color tags — make sure signage is current and visible.',
    resourceLinks: [],
    category: 'weekly',
  },
  {
    id: 'weekly-6',
    title: 'Recycling Report Review',
    description: 'Check recycle report in Power BI, address any issues with recycling vs. trash sorting.',
    subTasks: [
      { id: 'weekly-6-1', title: 'Pull recycling report in Power BI' },
      { id: 'weekly-6-2', title: 'Compare recycling vs. trash ratios' },
      { id: 'weekly-6-3', title: 'Address sorting issues with team' },
    ],
    tips: 'Recycling directly impacts profitability. Monitor the numbers and coach the team on proper sorting.',
    resourceLinks: [
      { label: 'Power BI', url: 'https://app.powerbi.com' },
    ],
    category: 'weekly',
  },
  {
    id: 'weekly-7',
    title: 'Loss Prevention Review',
    description: 'Review Solink (camera system), address any LP concerns.',
    subTasks: [
      { id: 'weekly-7-1', title: 'Review Solink alerts' },
      { id: 'weekly-7-2', title: 'Check for any LP incidents' },
      { id: 'weekly-7-3', title: 'Follow up on open investigations' },
    ],
    tips: 'Prevention is better than detection. Most theft is deterred by visible, engaged staff.',
    resourceLinks: [],
    category: 'weekly',
  },
  {
    id: 'weekly-8',
    title: 'HR / Administrative',
    description: 'Handle any disciplinary documentation, coaching conversations, employee relations follow-ups.',
    subTasks: [
      { id: 'weekly-8-1', title: 'Complete pending documentation' },
      { id: 'weekly-8-2', title: 'Follow up on coaching conversations' },
      { id: 'weekly-8-3', title: 'Address employee relations matters' },
    ],
    tips: 'Document everything. Good documentation protects everyone involved.',
    resourceLinks: [
      { label: 'Dayforce', url: 'https://www.dayforcehcm.com/' },
    ],
    category: 'weekly',
  },
  {
    id: 'weekly-9',
    title: 'Calendar Planning',
    description: 'Schedule focus time, meetings, maintain calendar discipline for the upcoming week.',
    subTasks: [
      { id: 'weekly-9-1', title: 'Block focus time for key priorities' },
      { id: 'weekly-9-2', title: 'Schedule all recurring meetings' },
      { id: 'weekly-9-3', title: 'Review and clean up calendar' },
    ],
    tips: '"Following your calendar will protect your time." If it isn\'t on the calendar, it won\'t happen.',
    resourceLinks: [
      { label: 'Outlook Calendar', url: 'https://outlook.office.com/calendar/' },
    ],
    category: 'weekly',
  },
];

export const monthlyTasks: TaskDefinition[] = [
  {
    id: 'monthly-1',
    title: 'P&L Review',
    description: 'Review store Profit & Loss statement, identify trends and action items.',
    subTasks: [
      { id: 'monthly-1-1', title: 'Review full P&L statement' },
      { id: 'monthly-1-2', title: 'Identify cost variances' },
      { id: 'monthly-1-3', title: 'Create action plan for improvements' },
    ],
    tips: 'Know your numbers. The P&L tells the story of your store. Every line item is something you can influence.',
    resourceLinks: [],
    category: 'monthly',
  },
  {
    id: 'monthly-2',
    title: 'Forecast Planning',
    description: 'Use Forecast Tool and Forecast Planner to project labor and production needs.',
    subTasks: [
      { id: 'monthly-2-1', title: 'Run forecast model' },
      { id: 'monthly-2-2', title: 'Review projected labor needs' },
      { id: 'monthly-2-3', title: 'Align production targets' },
    ],
    tips: '"If it isn\'t planned, it won\'t happen." Forecasting is how you stay ahead of the business.',
    resourceLinks: [],
    category: 'monthly',
  },
  {
    id: 'monthly-3',
    title: 'Store Visit Preparation',
    description: 'Review Store Visit Guidelines, ensure store is audit-ready.',
    subTasks: [
      { id: 'monthly-3-1', title: 'Review Store Visit Guidelines' },
      { id: 'monthly-3-2', title: 'Self-audit using visit checklist' },
      { id: 'monthly-3-3', title: 'Address any gaps before visit' },
    ],
    tips: 'If your store is always visit-ready, visits become celebrations, not stress events.',
    resourceLinks: [],
    category: 'monthly',
  },
  {
    id: 'monthly-4',
    title: 'Safety & Risk Review',
    description: 'Review any Origami (Workman\'s Comp) claims, incidents, and trends.',
    subTasks: [
      { id: 'monthly-4-1', title: 'Review Origami claims' },
      { id: 'monthly-4-2', title: 'Analyze incident trends' },
      { id: 'monthly-4-3', title: 'Update safety action plan' },
    ],
    tips: 'Track patterns, not just incidents. Are injuries happening in the same area? Same time? Address root causes.',
    resourceLinks: [
      { label: 'Origami', url: 'https://live.origamirisk.com/Origami/Account/Login' },
    ],
    category: 'monthly',
  },
  {
    id: 'monthly-5',
    title: 'Talent Review & Development',
    description: 'Assess team bench strength, identify development opportunities, review hiring pipeline.',
    subTasks: [
      { id: 'monthly-5-1', title: 'Review team performance' },
      { id: 'monthly-5-2', title: 'Identify development opportunities' },
      { id: 'monthly-5-3', title: 'Review hiring pipeline status' },
      { id: 'monthly-5-4', title: 'Update succession plan' },
    ],
    tips: '"Build a bench for the next role." Every GM should be developing at least one person to grow into leadership.',
    resourceLinks: [],
    category: 'monthly',
  },
  {
    id: 'monthly-6',
    title: 'Scheduling Tool Audit',
    description: 'Verify scheduling tools are being used effectively, labor aligns with business needs.',
    subTasks: [
      { id: 'monthly-6-1', title: 'Audit tool usage compliance' },
      { id: 'monthly-6-2', title: 'Compare labor to results' },
      { id: 'monthly-6-3', title: 'Identify scheduling optimizations' },
    ],
    tips: 'Proper scheduling is the #1 controllable expense. Small improvements here have big P&L impact.',
    resourceLinks: [],
    category: 'monthly',
  },
  {
    id: 'monthly-7',
    title: 'Supply Chain Coordination',
    description: 'Connect with Supply Chain on forecasting and ensuring proper donation supply.',
    subTasks: [
      { id: 'monthly-7-1', title: 'Connect with Dave Lomberg / Brian Hauckes' },
      { id: 'monthly-7-2', title: 'Review donation supply trends' },
      { id: 'monthly-7-3', title: 'Update forecasting needs' },
    ],
    tips: 'No donations = no product = no sales. Maintain strong relationships with Supply Chain.',
    resourceLinks: [],
    category: 'monthly',
  },
  {
    id: 'monthly-8',
    title: 'Marketing Touchbase',
    description: 'Coordinate with Marketing on any store-level promotions or initiatives.',
    subTasks: [
      { id: 'monthly-8-1', title: 'Check in with Phoebe Gaston / Dylan Houck' },
      { id: 'monthly-8-2', title: 'Review upcoming promotions' },
      { id: 'monthly-8-3', title: 'Align store execution with marketing plans' },
    ],
    tips: 'Marketing drives traffic. Make sure your team knows what promotions are running and how to execute them.',
    resourceLinks: [],
    category: 'monthly',
  },
];
