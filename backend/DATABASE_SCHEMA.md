# Task Manager — Database Schema

**Database:** MongoDB  
**Database name:** `taskmanager` (from `DATABASE_NAME` in `.env`)  
**Connection:** `MONGODB_URL` in `.env` (e.g. `mongodb://localhost:27017`)

---

## Overview

```
┌─────────────┐       1:N        ┌─────────────┐       1:N        ┌────────────────┐
│    users    │ ───────────────► │    tasks    │ ───────────────► │  task_history  │
└─────────────┘                  └─────────────┘                  └────────────────┘
```

- One **user** can have many **tasks**
- One **task** can have many **history** records (one per update)

---

## Collection: `users`

Stores registered user accounts.

| Field      | Type     | Required | Default | Description                          |
|------------|----------|----------|---------|--------------------------------------|
| `_id`      | ObjectId | Yes      | Auto    | Unique user ID (MongoDB primary key) |
| `name`     | String   | Yes      | —       | Display name                         |
| `email`    | String   | Yes      | —       | Login email (unique in app logic)    |
| `password` | String   | Yes      | —       | Bcrypt hashed password (never plain) |

### Example document

```json
{
  "_id": ObjectId("665f1a2b3c4d5e6f7a8b9c0a"),
  "name": "Alka Kumari",
  "email": "user@example.com",
  "password": "$2b$12$..."
}
```

### Notes

- Email uniqueness is checked in application code, not enforced by a DB index
- Password is hashed in `core/security.py` before insert

---

## Collection: `tasks`

Stores tasks owned by users.

| Field         | Type     | Required | Default   | Description                              |
|---------------|----------|----------|-----------|------------------------------------------|
| `_id`         | ObjectId | Yes      | Auto      | Unique task ID                           |
| `user_id`     | String   | Yes      | —         | Owner's user ID (string form of ObjectId)|
| `title`       | String   | Yes      | —         | Task title                               |
| `description` | String   | No       | `null`    | Optional task description                |
| `status`      | String   | Yes      | `"todo"`  | Task status (see allowed values below)   |
| `end_date`    | DateTime | No       | `null`    | Optional deadline                        |
| `created_at`  | DateTime | Yes      | On create | When the task was created (UTC)          |
| `updated_at`  | DateTime | Yes      | On create | Last update time (UTC)                   |
| `is_active`   | Boolean  | Yes      | `true`    | `false` = soft deleted                   |
| `version`     | Integer  | Yes      | `1`       | Increments on every update               |

### Allowed `status` values

| Value          | Meaning      | UI label     |
|----------------|--------------|--------------|
| `todo`         | Not started  | Pending      |
| `in-progress`  | In progress  | In Progress  |
| `done`         | Completed    | Completed    |

### Example document

```json
{
  "_id": ObjectId("665f1a2b3c4d5e6f7a8b9c0d"),
  "user_id": "665f1a2b3c4d5e6f7a8b9c0a",
  "title": "Deploy API",
  "description": "Push backend to production",
  "status": "in-progress",
  "end_date": ISODate("2026-06-15T00:00:00.000Z"),
  "created_at": ISODate("2026-06-08T10:00:00.000Z"),
  "updated_at": ISODate("2026-06-08T11:30:00.000Z"),
  "is_active": true,
  "version": 2
}
```

### Behavior

| Action  | What happens                                                |
|---------|-------------------------------------------------------------|
| Create  | Sets `created_at`, `updated_at`, `is_active=true`, `version=1` |
| Update  | Saves old state to `task_history`, increments `version`, updates `updated_at` |
| Delete  | Soft delete: sets `is_active=false`, updates `updated_at`   |
| List    | Returns only `is_active=true` tasks by default              |

---

## Collection: `task_history`

Stores snapshots of a task **before each update** (versioning / audit trail).

| Field                | Type     | Required | Default | Description                              |
|----------------------|----------|----------|---------|------------------------------------------|
| `_id`                | ObjectId | Yes      | Auto    | Unique history record ID                 |
| `task_id`            | String   | Yes      | —       | Reference to `tasks._id`                 |
| `version`            | Integer  | Yes      | —       | Task version at time of snapshot         |
| `title`              | String   | Yes      | —       | Task title at that version               |
| `description`        | String   | No       | `null`  | Description at that version              |
| `status`             | String   | Yes      | —       | Status at that version                   |
| `end_date`           | DateTime | No       | `null`  | End date at that version                 |
| `created_at`         | DateTime | No       | `null`  | Original task `created_at` at snapshot   |
| `updated_at`         | DateTime | No       | `null`  | Task `updated_at` at snapshot            |
| `history_created_at` | DateTime | Yes      | On save | When this history record was created     |

### Example document

```json
{
  "_id": ObjectId("665f1a2b3c4d5e6f7a8b9c0e"),
  "task_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "version": 1,
  "title": "Deploy API",
  "description": "Push backend to production",
  "status": "todo",
  "end_date": ISODate("2026-06-15T00:00:00.000Z"),
  "created_at": ISODate("2026-06-08T10:00:00.000Z"),
  "updated_at": ISODate("2026-06-08T10:00:00.000Z"),
  "history_created_at": ISODate("2026-06-08T11:30:00.000Z")
}
```

### When history is created

```
User updates task (version 2)
        │
        ▼
┌───────────────────────────┐
│ Save current task (v1)    │  ──►  task_history collection
│ into task_history         │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Update task in tasks      │  version → 2, updated_at → now
└───────────────────────────┘
```

History is **not** created on create or soft delete — only on **update**.

---

## Relationships

```
users._id  ──────►  tasks.user_id        (one-to-many)
tasks._id  ──────►  task_history.task_id (one-to-many)
```

- No foreign key constraints (MongoDB is schemaless)
- Relationships enforced in application code (`use_cases/task_use_case.py`)

---

## Recommended Indexes (optional, not yet in code)

For better performance in production:

```javascript
// users
db.users.createIndex({ "email": 1 }, { unique: true })

// tasks
db.tasks.createIndex({ "user_id": 1, "is_active": 1 })
db.tasks.createIndex({ "user_id": 1, "status": 1 })

// task_history
db.task_history.createIndex({ "task_id": 1, "version": 1 })
```

---

## API ↔ Database mapping

| API endpoint                    | Collection(s) used      |
|---------------------------------|-------------------------|
| `POST /auth/register`           | `users`                 |
| `POST /auth/login`              | `users`                 |
| `GET /auth/me`                  | `users`                 |
| `POST /tasks`                   | `tasks`                 |
| `GET /tasks`                    | `tasks`                 |
| `GET /tasks/{id}`               | `tasks`                 |
| `PUT /tasks/{id}`               | `tasks`, `task_history` |
| `DELETE /tasks/{id}`            | `tasks` (soft delete)   |
| `GET /tasks/{id}/history`       | `task_history`          |

---

## Source files

| Collection      | Repository file                              |
|-----------------|----------------------------------------------|
| `users`         | `repositories/user_repository.py`            |
| `tasks`         | `repositories/task_repository.py`            |
| `task_history`  | `repositories/task_history_repository.py`    |
