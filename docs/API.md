# API Reference

GluedLaunch includes a server-side API for comment persistence.

## Comments API

Base path: `/api/comments`

### Get Comments

Fetch all comments for a specific token.

```
GET /api/comments?tokenAddress=<address>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tokenAddress` | string | Yes | Token contract address (0x...) |

**Response:** `200 OK`

```json
[
  {
    "id": "1719500000000-abc123",
    "tokenAddress": "0x1234...abcd",
    "author": "0xabcd...1234",
    "text": "Great project!",
    "timestamp": 1719500000
  }
]
```

Comments are sorted by timestamp (newest first).

**Error Response:** `400 Bad Request`

```json
{
  "error": "tokenAddress required"
}
```

### Create Comment

Post a new comment on a token.

```
POST /api/comments
Content-Type: application/json
```

**Request Body:**

```json
{
  "tokenAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "author": "0xabcdef1234567890abcdef1234567890abcdef12",
  "text": "This token looks promising!"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `tokenAddress` | string | Yes | Valid Ethereum address |
| `author` | string | Yes | Valid Ethereum address (0x + 40 hex chars) |
| `text` | string | Yes | 1-500 characters, trimmed |

**Response:** `201 Created`

```json
{
  "id": "1719500000000-abc123",
  "tokenAddress": "0x1234...abcd",
  "author": "0xabcd...1234",
  "text": "This token looks promising!",
  "timestamp": 1719500000
}
```

**Error Responses:**

`400 Bad Request` — Missing required fields:
```json
{
  "error": "tokenAddress, author, and text required"
}
```

`400 Bad Request` — Invalid text:
```json
{
  "error": "text must be 1-500 characters"
}
```

`400 Bad Request` — Invalid author address:
```json
{
  "error": "invalid author address"
}
```

## Data Storage

Comments are stored in a JSON file at `frontend/data/comments.json`. The file and directory are created automatically on first use.

**Note:** This is a simple file-based storage suitable for small-scale deployments. For production at scale, consider replacing with a database (PostgreSQL, MongoDB, etc.).

## Comment Schema

```typescript
interface Comment {
  id: string;           // Unique ID: timestamp-randomString
  tokenAddress: string; // Token contract address (lowercase)
  author: string;       // Author wallet address
  text: string;         // Comment text (1-500 chars)
  timestamp: number;    // Unix timestamp (seconds)
}
```
