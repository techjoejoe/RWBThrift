export interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: ResourceCategory;
    icon: string;
}

export type ResourceCategory = 'systems' | 'hr' | 'training' | 'contacts';

export const categoryLabels: Record<ResourceCategory, string> = {
    systems: 'Store Systems & Technology',
    hr: 'HR & People Resources',
    training: 'Training Content',
    contacts: 'Key Contacts',
};

export const resources: Resource[] = [
    { id: 'res-1', title: 'Dayforce (HCM)', description: 'Timekeeping, scheduling, payroll, HR functions.', url: 'https://www.dayforcehcm.com/', category: 'systems', icon: 'Clock' },
    { id: 'res-2', title: 'Email / Outlook', description: 'Company email and communication.', url: 'https://outlook.office.com/mail/', category: 'systems', icon: 'Mail' },
    { id: 'res-3', title: 'Calendar', description: 'Outlook Calendar for scheduling.', url: 'https://outlook.office.com/calendar/', category: 'systems', icon: 'Calendar' },
    { id: 'res-4', title: 'Microsoft Teams', description: 'Team communication and meetings.', url: 'https://teams.microsoft.com/v2/', category: 'systems', icon: 'MessageSquare' },
    { id: 'res-5', title: 'OneDrive', description: 'Personal cloud storage.', url: 'https://mmthrift-my.sharepoint.com/', category: 'systems', icon: 'Cloud' },
    { id: 'res-6', title: 'SharePoint', description: 'Company intranet and shared documents.', url: 'https://mmthrift.sharepoint.com/', category: 'systems', icon: 'FileText' },
    { id: 'res-7', title: 'IT Help Desk (SysAid)', description: 'Submit IT support tickets.', url: 'https://mmthrift.sysaidit.com/', category: 'systems', icon: 'Headphones' },
    { id: 'res-8', title: 'Origami (Workman\'s Comp)', description: 'Report workplace accidents and incidents.', url: 'https://live.origamirisk.com/Origami/Account/Login', category: 'systems', icon: 'Shield' },
    { id: 'res-9', title: 'Solink (Camera System)', description: 'LP camera monitoring. Access via LP dept.', url: '#', category: 'systems', icon: 'Camera' },
    { id: 'res-10', title: 'Service Channel', description: 'Facility maintenance and repair tickets.', url: '#', category: 'systems', icon: 'Wrench' },
    { id: 'res-11', title: 'Power BI', description: 'Sales, production, labor reports.', url: 'https://app.powerbi.com', category: 'systems', icon: 'BarChart3' },
    { id: 'res-12', title: 'DEEP', description: 'Overview and manager form submission.', url: '#', category: 'systems', icon: 'Layers' },
    { id: 'res-13', title: 'Shipit', description: 'Trailer logging and tracking.', url: '#', category: 'systems', icon: 'Truck' },
    { id: 'res-14', title: 'RWB Directory', description: 'Company-wide employee directory.', url: '#', category: 'hr', icon: 'BookOpen' },
    { id: 'res-15', title: 'Job Description Library', description: 'Full library of job descriptions.', url: '#', category: 'hr', icon: 'FileText' },
    { id: 'res-16', title: 'Final Pay & Procedures by State', description: 'State-by-state final pay requirements.', url: '#', category: 'hr', icon: 'Map' },
    { id: 'res-17', title: 'People Passport Print Out', description: 'Printable certification tracking document.', url: '#', category: 'hr', icon: 'Award' },
    { id: 'res-18', title: 'People Passport Training', description: 'Training modules on SharePoint.', url: 'https://mmthrift.sharepoint.com/', category: 'hr', icon: 'GraduationCap' },
    { id: 'res-19', title: 'Performance Management', description: 'Performance review resources.', url: '#', category: 'hr', icon: 'TrendingUp' },
    { id: 'res-20', title: 'HR Q&A', description: 'Common HR questions and answers.', url: '#', category: 'hr', icon: 'HelpCircle' },
    { id: 'res-21', title: 'Learning & Development Portal', description: 'Central training hub.', url: '#', category: 'hr', icon: 'Lightbulb' },
    { id: 'res-22', title: 'Production Training Videos', description: 'Departmental production training.', url: '#', category: 'training', icon: 'Video' },
    { id: 'res-23', title: 'Retail Manager Guided Work', description: 'RM daily operations guide.', url: '#', category: 'training', icon: 'BookOpen' },
    { id: 'res-24', title: 'Production Manager Guided Work', description: 'PM daily operations guide.', url: '#', category: 'training', icon: 'BookOpen' },
    { id: 'res-25', title: 'RM Call Slides', description: 'Weekly call presentation slides.', url: '#', category: 'training', icon: 'Presentation' },
    { id: 'res-26', title: 'People Passport: Tech Essentials', description: 'Technology Essentials certification.', url: '#', category: 'training', icon: 'Laptop' },
    { id: 'res-27', title: 'People Passport: I-9 Compliance', description: 'I-9 Compliance certification.', url: '#', category: 'training', icon: 'ClipboardCheck' },
    { id: 'res-28', title: 'People Passport: HR Essentials', description: 'HR Essentials certification.', url: '#', category: 'training', icon: 'Users' },
    { id: 'res-29', title: 'People Passport: Safety & Risk', description: 'Safety & Risk Management certification.', url: '#', category: 'training', icon: 'ShieldCheck' },
    { id: 'res-30', title: 'People Passport: Loss Prevention', description: 'Loss Prevention certification.', url: '#', category: 'training', icon: 'Lock' },
    { id: 'res-31', title: 'People Passport: Recruiting', description: 'Recruiting certification.', url: '#', category: 'training', icon: 'UserPlus' },
    { id: 'res-32', title: 'People Passport: Employee Relations', description: 'Employee Relations certification.', url: '#', category: 'training', icon: 'Heart' },
    { id: 'res-33', title: 'People Passport: Payroll & Timekeeping', description: 'Payroll certification.', url: '#', category: 'training', icon: 'DollarSign' },
    { id: 'res-34', title: 'People Passport: FMLA / Leaves', description: 'FMLA and Accommodations certification.', url: '#', category: 'training', icon: 'Calendar' },
    { id: 'res-35', title: 'Dave Lomberg — Supply Chain', description: 'Supply Chain leadership.', url: '#', category: 'contacts', icon: 'User' },
    { id: 'res-36', title: 'Brian Hauckes — Supply Chain', description: 'Supply Chain contact.', url: '#', category: 'contacts', icon: 'User' },
    { id: 'res-37', title: 'Tara McGrady — HR', description: 'HR policy and Dayforce procedures.', url: '#', category: 'contacts', icon: 'User' },
    { id: 'res-38', title: 'Britney Spyker — Claims', description: 'Workman\'s Comp claims support.', url: '#', category: 'contacts', icon: 'User' },
    { id: 'res-39', title: 'Phoebe Gaston — Marketing', description: 'Marketing and promotions.', url: '#', category: 'contacts', icon: 'User' },
    { id: 'res-40', title: 'Dylan Houck — Marketing / Recycling', description: 'Marketing and recycling.', url: '#', category: 'contacts', icon: 'User' },
    { id: 'res-41', title: 'Dan Kober — Loss Prevention', description: 'LP standards and investigations.', url: '#', category: 'contacts', icon: 'User' },
    { id: 'res-42', title: 'IT Support — SysAid', description: 'Submit IT tickets via SysAid.', url: 'https://mmthrift.sysaidit.com/', category: 'contacts', icon: 'Headphones' },
];
