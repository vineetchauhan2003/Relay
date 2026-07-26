import {
  SLA_TARGET_HOURS,
  type Activity,
  type Agent,
  type Article,
  type CatalogService,
  type Category,
  type Priority,
  type Status,
  type Ticket,
  type TicketType,
} from './constants'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function iso(offsetMs: number): string {
  return new Date(Date.now() - offsetMs).toISOString()
}

export const AGENTS: Agent[] = [
  { id: 'agent-1', name: 'Maya Okonkwo', email: 'maya.o@relay.io', role: 'agent', team: 'Service Desk' },
  { id: 'agent-2', name: 'Dev Ramnath', email: 'dev.r@relay.io', role: 'agent', team: 'Service Desk' },
  { id: 'agent-3', name: 'Lena Fischer', email: 'lena.f@relay.io', role: 'agent', team: 'Endpoint' },
  { id: 'agent-4', name: 'Tomás Guerra', email: 'tomas.g@relay.io', role: 'agent', team: 'Infrastructure' },
  { id: 'agent-5', name: 'Priya Nair', email: 'priya.n@relay.io', role: 'agent', team: 'Endpoint' },
  { id: 'agent-6', name: 'Wes Carter', email: 'wes.c@relay.io', role: 'manager', team: 'Service Desk' },
  { id: 'req-1', name: 'Hannah Blythe', email: 'hannah.b@acme.co', role: 'requester', team: 'Sales' },
  { id: 'req-2', name: 'Marcus Webb', email: 'marcus.w@acme.co', role: 'requester', team: 'Finance' },
  { id: 'req-3', name: 'Aisha Rahman', email: 'aisha.r@acme.co', role: 'requester', team: 'Marketing' },
  { id: 'req-4', name: 'Jon Petersen', email: 'jon.p@acme.co', role: 'requester', team: 'Operations' },
]

const AGENT_IDS = ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5']
const REQUESTER_IDS = ['req-1', 'req-2', 'req-3', 'req-4', 'agent-1', 'agent-3']

type Spec = {
  type: TicketType
  subject: string
  category: Category
  priority: Priority
  status: Status
}

const INCIDENT_SPECS: Spec[] = [
  { type: 'incident', subject: 'Laptop will not power on after update', category: 'hardware', priority: 'high', status: 'in_progress' },
  { type: 'incident', subject: 'VPN drops every few minutes', category: 'network', priority: 'urgent', status: 'new' },
  { type: 'incident', subject: 'Outlook stuck on "trying to connect"', category: 'email', priority: 'high', status: 'in_progress' },
  { type: 'incident', subject: 'Cannot access shared finance drive', category: 'access', priority: 'medium', status: 'on_hold' },
  { type: 'incident', subject: 'Zoom audio cutting out in meetings', category: 'software', priority: 'low', status: 'resolved' },
  { type: 'incident', subject: 'Printer on 3rd floor offline', category: 'hardware', priority: 'low', status: 'new' },
  { type: 'incident', subject: 'Salesforce login loops back to sign-in', category: 'access', priority: 'urgent', status: 'in_progress' },
  { type: 'incident', subject: 'Two-factor codes not arriving by SMS', category: 'access', priority: 'high', status: 'new' },
  { type: 'incident', subject: 'Wi-Fi unusable in the east wing', category: 'network', priority: 'medium', status: 'in_progress' },
  { type: 'incident', subject: 'Excel crashes when opening large workbook', category: 'software', priority: 'medium', status: 'resolved' },
  { type: 'incident', subject: 'External monitor not detected on dock', category: 'hardware', priority: 'low', status: 'on_hold' },
  { type: 'incident', subject: 'Suspicious phishing email reported', category: 'email', priority: 'urgent', status: 'closed' },
  { type: 'incident', subject: 'Slack notifications completely silent', category: 'software', priority: 'low', status: 'new' },
  { type: 'incident', subject: 'Shared mailbox missing sent items', category: 'email', priority: 'medium', status: 'in_progress' },
  { type: 'incident', subject: 'Disk almost full, cannot save files', category: 'hardware', priority: 'high', status: 'new' },
  { type: 'incident', subject: 'Company website returns 502 internally', category: 'network', priority: 'urgent', status: 'in_progress' },
  { type: 'incident', subject: 'Password reset email never delivered', category: 'access', priority: 'medium', status: 'resolved' },
  { type: 'incident', subject: 'Teams call quality degraded office-wide', category: 'network', priority: 'high', status: 'on_hold' },
  { type: 'incident', subject: 'Antivirus flagging internal tool', category: 'software', priority: 'medium', status: 'new' },
  { type: 'incident', subject: 'Docking station firmware update failed', category: 'hardware', priority: 'low', status: 'closed' },
  { type: 'incident', subject: 'Calendar invites showing wrong timezone', category: 'email', priority: 'low', status: 'resolved' },
  { type: 'incident', subject: 'Repeated Kerberos authentication errors', category: 'access', priority: 'high', status: 'in_progress' },
  { type: 'incident', subject: 'Guest Wi-Fi captive portal broken', category: 'network', priority: 'medium', status: 'new' },
  { type: 'incident', subject: 'Screen flickers on battery power', category: 'hardware', priority: 'low', status: 'on_hold' },
  { type: 'incident', subject: 'CRM export produces empty CSV', category: 'software', priority: 'medium', status: 'in_progress' },
  { type: 'incident', subject: 'Mailbox over quota, cannot send', category: 'email', priority: 'high', status: 'new' },
  { type: 'incident', subject: 'Badge reader denies valid credentials', category: 'access', priority: 'urgent', status: 'in_progress' },
  { type: 'incident', subject: 'Frequent blue screens on startup', category: 'hardware', priority: 'high', status: 'on_hold' },
  { type: 'incident', subject: 'DNS resolution slow for internal apps', category: 'network', priority: 'medium', status: 'resolved' },
  { type: 'incident', subject: 'Design app license deactivated randomly', category: 'software', priority: 'medium', status: 'new' },
]

const REQUEST_SPECS: Spec[] = [
  { type: 'request', subject: 'New laptop for incoming hire', category: 'hardware', priority: 'medium', status: 'new' },
  { type: 'request', subject: 'Adobe Creative Cloud license', category: 'software', priority: 'low', status: 'in_progress' },
  { type: 'request', subject: 'VPN access for remote contractor', category: 'network', priority: 'medium', status: 'new' },
  { type: 'request', subject: 'Add me to the marketing distribution list', category: 'email', priority: 'low', status: 'resolved' },
  { type: 'request', subject: 'Access to production analytics dashboard', category: 'access', priority: 'medium', status: 'on_hold' },
  { type: 'request', subject: 'Second monitor for home office', category: 'hardware', priority: 'low', status: 'new' },
  { type: 'request', subject: 'Onboarding kit for new sales rep', category: 'other', priority: 'high', status: 'in_progress' },
  { type: 'request', subject: 'Password reset for shared service account', category: 'access', priority: 'high', status: 'new' },
  { type: 'request', subject: 'Install Figma on design workstation', category: 'software', priority: 'low', status: 'resolved' },
  { type: 'request', subject: 'Provision new team mailing list', category: 'email', priority: 'medium', status: 'new' },
  { type: 'request', subject: 'Upgrade RAM on engineering laptop', category: 'hardware', priority: 'medium', status: 'on_hold' },
  { type: 'request', subject: 'Guest network access for auditors', category: 'network', priority: 'medium', status: 'in_progress' },
  { type: 'request', subject: 'Elevated admin rights for QA machine', category: 'access', priority: 'high', status: 'new' },
  { type: 'request', subject: 'Standing desk and ergonomic chair', category: 'other', priority: 'low', status: 'closed' },
  { type: 'request', subject: 'Slack Enterprise Grid workspace access', category: 'software', priority: 'low', status: 'new' },
  { type: 'request', subject: 'Corporate phone plan for field team', category: 'other', priority: 'medium', status: 'in_progress' },
  { type: 'request', subject: 'Restore archived project mailbox', category: 'email', priority: 'medium', status: 'new' },
  { type: 'request', subject: 'Static IP for lab equipment', category: 'network', priority: 'low', status: 'resolved' },
  { type: 'request', subject: 'Loaner laptop for travel', category: 'hardware', priority: 'medium', status: 'new' },
  { type: 'request', subject: 'Group access to finance SharePoint', category: 'access', priority: 'medium', status: 'in_progress' },
  { type: 'request', subject: 'Renew expiring code-signing certificate', category: 'software', priority: 'high', status: 'new' },
  { type: 'request', subject: 'New starter accounts for Q3 cohort', category: 'other', priority: 'high', status: 'on_hold' },
  { type: 'request', subject: 'Webcam replacement for meeting room', category: 'hardware', priority: 'low', status: 'resolved' },
  { type: 'request', subject: 'Add shared calendar for on-call rota', category: 'email', priority: 'low', status: 'new' },
  { type: 'request', subject: 'Provision dev sandbox environment', category: 'software', priority: 'medium', status: 'in_progress' },
  { type: 'request', subject: 'Wi-Fi extender for warehouse office', category: 'network', priority: 'medium', status: 'new' },
  { type: 'request', subject: 'Temporary access badge for visitor', category: 'access', priority: 'low', status: 'closed' },
  { type: 'request', subject: 'Bulk license renewal for design suite', category: 'software', priority: 'medium', status: 'new' },
  { type: 'request', subject: 'Headset for customer support pod', category: 'hardware', priority: 'low', status: 'resolved' },
  { type: 'request', subject: 'Set up automated ticket forwarding', category: 'email', priority: 'medium', status: 'in_progress' },
]

const COMMENT_BODIES = [
  'Thanks for reporting — taking a look now.',
  'Could you confirm which building you are in?',
  'Reproduced on my side, escalating to the endpoint team.',
  'Applied a temporary workaround, monitoring for recurrence.',
  'Awaiting parts from the supplier, ETA tomorrow.',
  'Restarted the affected service, please retry.',
  'Left a voicemail with the requester for more detail.',
]

let incidentCounter = 1041
let requestCounter = 2008

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function buildActivity(spec: Spec, createdOffset: number, requesterId: string, assigneeId: string | null, i: number): Activity[] {
  const list: Activity[] = [
    {
      id: `act-${spec.subject.length}-${i}-0`,
      type: 'system',
      authorId: requesterId,
      body: `logged this ${spec.type}`,
      createdAt: iso(createdOffset),
    },
  ]
  const extra = 1 + (i % 4)
  for (let n = 1; n <= extra; n++) {
    const laterOffset = Math.max(createdOffset - n * 3 * HOUR, HOUR)
    const isComment = n % 2 === 1
    list.push({
      id: `act-${spec.subject.length}-${i}-${n}`,
      type: isComment ? 'comment' : 'system',
      authorId: isComment ? assigneeId ?? 'agent-1' : 'agent-6',
      body: isComment ? pick(COMMENT_BODIES, i + n) : `changed status to ${spec.status.replace('_', ' ')}`,
      visibility: isComment ? (n % 3 === 0 ? 'internal' : 'public') : undefined,
      createdAt: iso(laterOffset),
    })
  }
  return list
}

function buildTicket(spec: Spec, i: number): Ticket {
  const key =
    spec.type === 'incident' ? `INC-${++incidentCounter}` : `REQ-${++requestCounter}`
  // Spread creation across the last ~14 days.
  const createdOffset = (i * 11) % (14 * DAY) + 2 * HOUR
  const requesterId = pick(REQUESTER_IDS, i)
  // ~8 unassigned: every 4th new/on_hold ticket has no assignee.
  const unassigned = (spec.status === 'new' || spec.status === 'on_hold') && i % 4 === 0
  const assigneeId = unassigned ? null : pick(AGENT_IDS, i)
  const targetMs = SLA_TARGET_HOURS[spec.priority] * HOUR
  const createdAt = iso(createdOffset)
  const slaDueAt = new Date(new Date(createdAt).getTime() + targetMs).toISOString()
  const isResolved = spec.status === 'resolved' || spec.status === 'closed'
  const resolvedAt = isResolved ? iso(Math.max(createdOffset - 6 * HOUR, HOUR)) : null
  const activity = buildActivity(spec, createdOffset, requesterId, assigneeId, i)
  const updatedAt = activity[activity.length - 1].createdAt
  return {
    id: `tk-${i}`,
    key,
    type: spec.type,
    subject: spec.subject,
    description: `${spec.subject}. Reported via the service desk; requester has provided initial details and is available for follow-up during business hours.`,
    status: spec.status,
    priority: spec.priority,
    category: spec.category,
    requesterId,
    assigneeId,
    createdAt,
    updatedAt,
    slaDueAt,
    resolvedAt,
    activity,
  }
}

export function buildSeedTickets(): Ticket[] {
  const specs = [...INCIDENT_SPECS, ...REQUEST_SPECS]
  const tickets = specs.map((spec, i) => buildTicket(spec, i))
  // Newest first.
  return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const CATALOG_SERVICES: CatalogService[] = [
  { id: 'svc-1', name: 'New laptop', description: 'Request a standard-issue laptop for a new or existing employee.', category: 'hardware', icon: 'Laptop', fulfillmentTime: '3–5 business days' },
  { id: 'svc-2', name: 'Second monitor', description: 'Add an external display to your workstation setup.', category: 'hardware', icon: 'Monitor', fulfillmentTime: '2–3 business days' },
  { id: 'svc-3', name: 'Software license', description: 'Request a license for approved business software.', category: 'software', icon: 'Package', fulfillmentTime: '1–2 business days' },
  { id: 'svc-4', name: 'Design suite access', description: 'Provision Figma and Creative Cloud for design work.', category: 'software', icon: 'PenTool', fulfillmentTime: '1–2 business days' },
  { id: 'svc-5', name: 'VPN access', description: 'Secure remote access to the corporate network.', category: 'network', icon: 'ShieldCheck', fulfillmentTime: 'Same business day' },
  { id: 'svc-6', name: 'Guest Wi-Fi', description: 'Temporary network access for visitors and auditors.', category: 'network', icon: 'Wifi', fulfillmentTime: 'Within 2 hours' },
  { id: 'svc-7', name: 'Password reset', description: 'Reset a forgotten password for your account.', category: 'access', icon: 'KeyRound', fulfillmentTime: 'Within 1 hour' },
  { id: 'svc-8', name: 'Application access', description: 'Request access to an internal application or dashboard.', category: 'access', icon: 'LockKeyhole', fulfillmentTime: '1–2 business days' },
  { id: 'svc-9', name: 'Mailing list', description: 'Create or join a team distribution list.', category: 'email', icon: 'Mails', fulfillmentTime: 'Same business day' },
  { id: 'svc-10', name: 'Shared mailbox', description: 'Provision a shared mailbox for a team or function.', category: 'email', icon: 'Inbox', fulfillmentTime: '1–2 business days' },
  { id: 'svc-11', name: 'Onboarding kit', description: 'Full account, hardware and access setup for a new hire.', category: 'other', icon: 'PackagePlus', fulfillmentTime: '3–5 business days' },
  { id: 'svc-12', name: 'Ergonomic equipment', description: 'Standing desk, chair or accessories for your workspace.', category: 'other', icon: 'Armchair', fulfillmentTime: '5–7 business days' },
]

function article(
  id: string,
  slug: string,
  title: string,
  category: Article['category'],
  excerpt: string,
  body: string[],
  authorId: string,
  daysAgo: number,
  views: number,
): Article {
  return { id, slug, title, category, excerpt, body, authorId, updatedAt: iso(daysAgo * DAY), views }
}

export const ARTICLES: Article[] = [
  article('kb-1', 'connect-to-vpn', 'How to connect to the corporate VPN', 'Network',
    'Step-by-step setup for secure remote access from any device.',
    ['The corporate VPN gives you encrypted access to internal systems while working remotely.',
     'Open the VPN client from your applications list and sign in with your corporate credentials.',
     'Select the region closest to you, then choose Connect. A green status indicator confirms you are connected.',
     'If the connection drops repeatedly, switch networks or restart the client before raising an incident.'], 'agent-4', 3, 1240),
  article('kb-2', 'reset-your-password', 'Reset your password', 'Accounts',
    'Recover access to your account in a few minutes.',
    ['You can reset your own password from the sign-in screen without contacting the service desk.',
     'Choose "Forgot password", enter your corporate email, and follow the link sent to your inbox.',
     'Passwords must be at least 12 characters and include a number and a symbol.',
     'If the reset email does not arrive within ten minutes, check spam then raise an access request.'], 'agent-1', 1, 3102),
  article('kb-3', 'set-up-new-laptop', 'Setting up your new laptop', 'Getting Started',
    'Everything to do on day one with a freshly issued device.',
    ['Your new laptop arrives pre-enrolled in device management, so most apps install automatically.',
     'Sign in with your corporate account and allow the initial configuration to finish before installing anything.',
     'Enable disk encryption when prompted — this is required for all company devices.',
     'Set up multi-factor authentication and you are ready to work.'], 'agent-3', 5, 890),
  article('kb-4', 'fix-outlook-connection', 'Fixing Outlook connection problems', 'Email',
    'What to try when Outlook is stuck connecting.',
    ['Outlook occasionally loses its connection to the mail server after updates or network changes.',
     'First, confirm other apps have internet access, then fully quit and reopen Outlook.',
     'If it stays stuck, use the Repair option in account settings to rebuild the profile.',
     'Persisting issues after a repair should be logged as an email incident.'], 'agent-2', 2, 1567),
  article('kb-5', 'request-software', 'Requesting new software', 'Software',
    'How to get approved applications installed quickly.',
    ['All software installs go through the service catalog so licensing stays compliant.',
     'Search the catalog for the application you need and submit a request.',
     'Approved requests are pushed to your device automatically; you will see them appear within a business day.',
     'Unlisted software requires manager approval before it can be sourced.'], 'agent-5', 4, 654),
  article('kb-6', 'join-mailing-list', 'Joining a mailing list', 'Email',
    'Add yourself to team distribution lists.',
    ['Mailing lists route announcements and discussions to the right people.',
     'Request membership through the catalog and the list owner will approve it.',
     'You can leave a list at any time from your account preferences.'], 'agent-2', 7, 412),
  article('kb-7', 'secure-remote-work', 'Staying secure while working remotely', 'Getting Started',
    'Good habits for protecting company data off-site.',
    ['Remote work expands where company data travels, so a few habits keep it safe.',
     'Always connect through the VPN when accessing internal systems.',
     'Lock your screen when stepping away and never use public machines for corporate accounts.',
     'Report any lost device immediately so access can be revoked.'], 'agent-6', 6, 998),
  article('kb-8', 'printer-troubleshooting', 'Troubleshooting office printers', 'Hardware',
    'Clear the most common printing problems yourself.',
    ['Most printer issues resolve with a few quick checks before a ticket is needed.',
     'Confirm the printer shows online and has paper and toner.',
     'Remove and re-add the printer from your device if jobs are not appearing.',
     'For hardware faults such as jams that will not clear, log a hardware incident.'], 'agent-3', 9, 337),
  article('kb-9', 'wifi-best-practices', 'Getting the best Wi-Fi in the office', 'Network',
    'Tips for a stable wireless connection at your desk.',
    ['Wi-Fi performance varies across the building depending on distance and interference.',
     'Connect to the "Corp" network rather than "Guest" for full access and better speeds.',
     'If speeds drop, forget and rejoin the network to refresh your connection.',
     'Persistent dead zones should be reported so we can add coverage.'], 'agent-4', 8, 521),
  article('kb-10', 'enable-mfa', 'Enabling multi-factor authentication', 'Accounts',
    'Add a second layer of protection to your account.',
    ['Multi-factor authentication is required for all corporate accounts.',
     'Install the authenticator app and scan the code shown in your security settings.',
     'Keep backup codes somewhere safe in case you lose your device.',
     'If you get a new phone, re-enrol before wiping the old one.'], 'agent-1', 10, 1203),
  article('kb-11', 'manage-storage', 'Freeing up disk space', 'Hardware',
    'Keep your device running smoothly when storage runs low.',
    ['A nearly full disk slows your device and can block saving files.',
     'Empty the trash and clear browser caches for a quick recovery.',
     'Move large archives to the shared drive rather than keeping them locally.',
     'If space is chronically tight, request a storage upgrade.'], 'agent-5', 12, 289),
  article('kb-12', 'access-shared-drives', 'Accessing shared drives', 'Accounts',
    'Find and connect to team file shares.',
    ['Shared drives keep team files in one governed place.',
     'Access is granted by group membership, so request the relevant group if a drive is missing.',
     'Map the drive once and it will reconnect automatically at sign-in.'], 'agent-2', 11, 476),
  article('kb-13', 'video-call-quality', 'Improving video call quality', 'Software',
    'Reduce lag and dropouts in meetings.',
    ['Call quality depends on your network and the load on your device.',
     'Use a wired connection or sit closer to an access point where possible.',
     'Close heavy applications before large meetings to free up resources.',
     'Report office-wide degradation so we can check the network.'], 'agent-4', 13, 388),
  article('kb-14', 'first-week-checklist', 'Your first-week IT checklist', 'Getting Started',
    'A short list to get fully set up in your first days.',
    ['Welcome aboard — a few IT steps will get you productive quickly.',
     'Sign in, enable multi-factor authentication, and complete device encryption.',
     'Install your core apps from the catalog and join your team mailing lists.',
     'Bookmark the knowledge base so answers are always one search away.'], 'agent-6', 2, 742),
]
