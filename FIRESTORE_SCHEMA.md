# Firestore Data Model

> GM Command Center — Schema Reference

## Collections

### `users/{uid}`
User profile document, created during signup.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Full name |
| `email` | string | Email address |
| `role` | string | `'gm'` \| `'dm'` \| `'admin'` \| `'trainer'` |
| `store` | string | Assigned store name |
| `photoURL` | string? | Profile photo URL (Firebase Storage) |
| `isOnboarding` | boolean | Whether user is in 20-day onboarding |
| `onboardingDay` | number? | Current onboarding day (1-20) |

---

### `users/{uid}/taskCompletions/{period}`
Task completion records, keyed by period string.

**Period key formats**:
- Daily: `YYYY-MM-DD` (e.g. `2026-02-23`)
- Weekly: `W-YYYY-MM-DD` (Monday of week, e.g. `W-2026-02-17`)
- Monthly: `M-YYYY-MM` (e.g. `M-2026-02`)

| Field | Type | Description |
|-------|------|-------------|
| `completions` | Record\<string, TaskCompletion\> | Map of taskId → completion data |

**TaskCompletion shape**:
| Field | Type | Description |
|-------|------|-------------|
| `taskId` | string | Task definition ID |
| `completedAt` | string | ISO timestamp |
| `notes` | string | Free-text notes |
| `isDelegated` | boolean | Whether task was delegated |
| `delegatedTo` | string? | Name of delegate |
| `delegatedAt` | string? | ISO timestamp of delegation |
| `followUpStatus` | string? | `'pending'` \| `'verified'` |
| `verifiedAt` | string? | ISO timestamp of verification |
| `durationSeconds` | number? | Time spent on task |

---

### `users/{uid}/stats/streak`
Daily streak tracking.

| Field | Type | Description |
|-------|------|-------------|
| `streak` | number | Current consecutive-day streak |
| `lastFullCompletionDate` | string \| null | Date of last 100% completion |

---

### `users/{uid}/delegationEvents/{date}`
Log of delegation actions per day.

| Field | Type | Description |
|-------|------|-------------|
| `events` | DelegationEvent[] | Array of delegation events |

**DelegationEvent shape**:
| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `'delegated'` \| `'cancelled'` \| `'verified'` |
| `taskId` | string | Task definition ID |
| `delegatedTo` | string | Name of delegate |
| `timestamp` | string | ISO timestamp |

---

### `users/{uid}/reflections/{date}`
End-of-day reflections.

| Field | Type | Description |
|-------|------|-------------|
| `rating` | number | Day rating (1-5) |
| `win` | string? | Today's biggest win |
| `challenge` | string? | Today's biggest challenge |
| `date` | string | Date string |
| `submittedAt` | string | ISO timestamp |

---

### `users/{uid}/storeVisits/{date}`
Store visit checklist results.

| Field | Type | Description |
|-------|------|-------------|
| `ratings` | Record\<string, string\> | Checklist item ID → rating |
| `savedAt` | string | ISO timestamp |

---

### `users/{uid}/meetings/{date}`
Meeting notes for a given day.

| Field | Type | Description |
|-------|------|-------------|
| `notes` | string | Meeting notes text |
| `savedAt` | string | ISO timestamp |

---

### `users/{uid}/training/progress`
Onboarding training progress.

| Field | Type | Description |
|-------|------|-------------|
| `completed` | Record\<string, boolean\> | Task ID → completed |
| `signOffs` | Record\<string, SignOff\> | Task ID → sign-off data |
| `notes` | Record\<string, string\> | Task ID → notes |

---

### `users/{uid}/team/members`
Team roster managed by GM.

| Field | Type | Description |
|-------|------|-------------|
| `members` | TeamMember[] | Array of team members |

---

### `stores/{storeId}`
Store registry.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Store name |
| `districtId` | string? | Assigned district ID |
| `createdAt` | string | ISO timestamp |

---

### `districts/{districtId}`
District registry.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | District name |
| `dmUid` | string? | Assigned DM user ID |
| `createdAt` | string | ISO timestamp |
