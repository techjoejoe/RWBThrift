process.env.GOOGLE_CLOUD_PROJECT = 'rwbgm-5eb5d';
const admin = require("firebase-admin");
admin.initializeApp({ projectId: "rwbgm-5eb5d", credential: admin.credential.applicationDefault() });
const db = admin.firestore();

const uid = "ejZpXifCabUzw9ZxhRRWZVzFmpo2";
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const dow = now.getDay();
const mon = new Date(now); mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
const weekKey = `W-${mon.getFullYear()}-${pad(mon.getMonth() + 1)}-${pad(mon.getDate())}`;
const monthKey = `M-${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

const iso = (h, m = 0) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d.toISOString(); };

const daily = {};
for (let i = 1; i <= 7; i++) daily[`daily-${i}`] = { taskId: `daily-${i}`, completedAt: iso(6 + i), notes: "", isDelegated: false };
daily["daily-4"].isDelegated = true; daily["daily-4"].delegatedTo = "Sarah — Asst. Mgr";
daily["daily-4"].followUpStatus = "verified"; daily["daily-4"].verifiedAt = iso(10);
daily["daily-6"].isDelegated = true; daily["daily-6"].delegatedTo = "Mike — Team Lead";
daily["daily-6"].followUpStatus = "pending";

const weekly = {};
[1, 2, 3, 5].forEach(i => weekly[`weekly-${i}`] = { taskId: `weekly-${i}`, completedAt: iso(14), notes: "", isDelegated: false });

const monthly = {};
[1, 2, 4].forEach(i => monthly[`monthly-${i}`] = { taskId: `monthly-${i}`, completedAt: iso(9), notes: "", isDelegated: false });

const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
const yKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
const yDaily = {};
for (let i = 1; i <= 11; i++) yDaily[`daily-${i}`] = { taskId: `daily-${i}`, completedAt: iso(6 + i), notes: "", isDelegated: false };

async function seed() {
  const batch = db.batch();
  const u = (path) => db.doc(`users/${uid}/${path}`);

  // User profile — set role to admin
  batch.set(db.doc(`users/${uid}`), { role: "admin", name: "Joe" }, { merge: true });

  // Task completions
  batch.set(u(`taskCompletions/${today}`), { completions: daily }, { merge: true });
  batch.set(u(`taskCompletions/${weekKey}`), { completions: weekly }, { merge: true });
  batch.set(u(`taskCompletions/${monthKey}`), { completions: monthly }, { merge: true });
  batch.set(u(`taskCompletions/${yKey}`), { completions: yDaily }, { merge: true });

  // Streak
  batch.set(u("stats/streak"), { streak: 5, lastFullCompletionDate: yKey });

  // Delegation events
  batch.set(u(`delegationEvents/${today}`), {
    events: [
      { type: "delegated", taskId: "daily-4", delegatedTo: "Sarah — Asst. Mgr", timestamp: iso(9, 15) },
      { type: "verified", taskId: "daily-4", delegatedTo: "Sarah — Asst. Mgr", timestamp: iso(10) },
      { type: "delegated", taskId: "daily-6", delegatedTo: "Mike — Team Lead", timestamp: iso(11) },
    ]
  });

  // Reflection
  batch.set(u(`reflections/${yKey}`), {
    rating: 4, win: "Hit daily sales target", challenge: "Receiving backed up",
    date: yKey, submittedAt: iso(17, 30)
  });

  // Team
  batch.set(u("team/members"), {
    members: [
      { id: "tm-1", name: "Sarah Johnson", role: "Assistant Manager", status: "active" },
      { id: "tm-2", name: "Mike Torres", role: "Team Lead", status: "active" },
      { id: "tm-3", name: "Jessica Williams", role: "Sales Associate", status: "active" },
      { id: "tm-4", name: "David Chen", role: "Receiving", status: "active" },
      { id: "tm-5", name: "Amy Rodriguez", role: "Cashier", status: "active" },
    ]
  });

  await batch.commit();
  console.log("✅ Demo data seeded successfully!");
  console.log(`   Today: ${today}, Week: ${weekKey}, Month: ${monthKey}`);
  console.log(`   Daily: 7/11, Weekly: 4/9, Monthly: 3/8, Streak: 5`);
  console.log(`   Role set to: admin`);
  console.log(`   Team: 5 members`);
  process.exit(0);
}
seed().catch(e => { console.error("❌ Seed failed:", e.message); process.exit(1); });
