# Notes API

A multi-user REST API for managing personal notes, built with Node.js, Express, and MongoDB. Supports user authentication, note sharing, pinning, full-text search, and pagination.

**Live:** https://notes-api-hapy.onrender.com

---

## Features

- JWT-based authentication with secure password hashing
- Full CRUD operations for notes
- Note sharing between registered users
- Pin/unpin notes — pinned notes always surface at the top
- Soft delete — notes are never permanently removed
- Full-text search across note titles and content
- Pagination support on note listing
- Tag support for personal categorization
- OpenAPI 3.0 specification served at runtime

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JSON Web Tokens (`jsonwebtoken`)
- **Password hashing:** bcryptjs
- **Validation:** express-validator
- **Process manager:** nodemon (dev)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A MongoDB connection string (MongoDB Atlas or local)

### Installation

```bash
git clone https://github.com/utkarshdev2411/Notes-API.git
cd Notes-API
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default: `3000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret string for signing tokens |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`) |

### Running Locally

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`.

---

## API Reference

### Base URL

```
https://notes-api-hapy.onrender.com
```

All protected routes require an `Authorization: Bearer <token>` header.

---

### Auth

#### Register

```
POST /register
```

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

| Status | Meaning |
|---|---|
| 201 | User registered successfully |
| 400 | Validation error (invalid email / password < 6 chars) |
| 409 | Email already registered |

---

#### Login

```
POST /login
```

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "access_token": "<jwt>"
}
```

| Status | Meaning |
|---|---|
| 200 | Login successful |
| 400 | Validation error |
| 401 | Invalid email or password |

> The same error message is returned for a wrong password and an unregistered email to prevent user enumeration.

---

### Notes

All notes endpoints require authentication.

#### Get All Notes

```
GET /notes
```

Returns notes owned by or shared with the authenticated user, sorted by pin status then last updated.

**Optional pagination query params:**

```
GET /notes?page=1&limit=10
```

Without pagination params, returns a flat array. With params, returns:

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

#### Get Note by ID

```
GET /notes/:id
```

Returns a note if the authenticated user is the owner or has been granted access via sharing.

| Status | Meaning |
|---|---|
| 200 | Note returned |
| 400 | Invalid ID format |
| 404 | Note not found or no access |

---

#### Create Note

```
POST /notes
```

```json
{
  "title": "Meeting notes",
  "content": "Discussed Q3 roadmap...",
  "tags": ["work", "q3"]
}
```

`tags` is optional.

| Status | Meaning |
|---|---|
| 201 | Note created |
| 400 | Validation error |

---

#### Update Note

```
PUT /notes/:id
```

```json
{
  "title": "Updated title",
  "content": "Updated content",
  "tags": ["updated"]
}
```

Owner only. `tags` is optional.

| Status | Meaning |
|---|---|
| 200 | Note updated |
| 400 | Validation error or invalid ID |
| 404 | Note not found or not the owner |

---

#### Delete Note

```
DELETE /notes/:id
```

Owner only. Performs a soft delete — the note becomes invisible to all queries but is retained in the database.

| Status | Meaning |
|---|---|
| 204 | Note deleted |
| 400 | Invalid ID format |
| 404 | Note not found or not the owner |

---

#### Share Note

```
POST /notes/:id/share
```

```json
{
  "share_with_email": "friend@example.com"
}
```

Owner only. Shared users can read the note but cannot edit, delete, or re-share it.

| Status | Meaning |
|---|---|
| 200 | Note shared successfully |
| 400 | Cannot share with yourself / already shared / validation error |
| 404 | Note not found / target user not registered |

---

#### Pin or Unpin Note

```
PATCH /notes/:id/pin
```

```json
{
  "isPinned": true
}
```

Owner only. Pinned notes appear first in `GET /notes`.

| Status | Meaning |
|---|---|
| 200 | Pin status updated |
| 400 | Invalid ID or non-boolean value |
| 404 | Note not found or not the owner |

---

### Search

```
GET /search?q=keyword
```

Full-text search across note titles and content. Results are scoped to notes owned by or shared with the authenticated user.

| Status | Meaning |
|---|---|
| 200 | Array of matching notes |
| 400 | Missing or empty `q` parameter |

---

### Meta

#### Health Check

```
GET /health
```

```json
{ "status": "ok" }
```

#### About

```
GET /about
```

Returns developer info and a description of custom features.

#### OpenAPI Specification

```
GET /openapi.json
```

Returns the full OpenAPI 3.0 specification for this API.

---

## Note Response Shape

All note responses follow this structure:

```json
{
  "id": "6a095e758b764e09051a0f24",
  "title": "My note",
  "content": "Note content here.",
  "isPinned": false,
  "tags": ["work"],
  "created_at": "2026-05-17T06:21:41.760Z",
  "updated_at": "2026-05-17T06:23:07.143Z"
}
```

---

## Error Response Shape

All error responses follow this structure:

```json
{
  "message": "Description of the error"
}
```

Validation errors include a field-level breakdown:

```json
{
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

---

## Project Structure

```
Notes-API/
├── server.js                   # Entry point
├── src/
│   ├── app.js                  # Express app setup
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── notes.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   └── validate.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── notes.routes.js
│   │   └── meta.routes.js
│   ├── utils/
│   │   └── response.js         # Note response formatter
│   └── openapi.json            # OpenAPI 3.0 spec
├── .env.example
├── render.yaml
└── package.json
```

---

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12) before storage
- JWT tokens expire after 7 days by default
- Accessing another user's note returns `404` rather than `403` to avoid confirming resource existence
- Login returns the same error message for wrong password and unregistered email

---

## Deployment

The API is configured for [Render](https://render.com) via `render.yaml`. Set `MONGO_URI` and `JWT_SECRET` as environment variables in the Render dashboard before deploying.

---

## License

MIT