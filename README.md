# Book My Ticket 🎬

A simplified movie seat booking platform built with **Node.js** and **PostgreSQL**. Extends a starter codebase by adding a complete authentication layer — users can register, login, and only authenticated users can book seats.

---

## Features

- User registration with hashed passwords (bcrypt)
- JWT-based login and session management
- Protected seat booking — only logged-in users can book
- Duplicate booking prevention via database transactions
- Seat bookings associated with the logged-in user's ID
- Mocked movie data — focus is on auth and booking logic

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and routing |
| PostgreSQL 16 | Relational database (via Docker) |
| pg (node-postgres) | Database driver — raw SQL queries |
| bcrypt | Password hashing |
| jsonwebtoken | JWT token generation and verification |
| dotenv | Environment variable management |
| Docker + Compose | Local PostgreSQL container |

---

## Folder Structure

```
book-my-ticket/
├── auth/
│   ├── authController.js   # req/res handlers for register & login
│   ├── authModel.js        # SQL queries for users table
│   ├── authRoute.js        # POST /api/auth/register, /api/auth/login
│   └── authService.js      # Business logic, bcrypt, JWT
├── db/
│   └── index.js            # pg.Pool connection, shared across app
├── middleware/
│   └── authMiddleware.js   # JWT verification middleware
├── .env                    # Environment variables
├── docker-compose.yml      # PostgreSQL container config
├── init.sql                # Table creation SQL
├── index.mjs               # Main entry point
└── package.json
```

---

## Setup & Installation

### Step 1 — Clone and Install
```bash
git clone <your-repo-url>
cd book-my-ticket
npm install
```

### Step 2 — Configure Environment
Create a `.env` file in the project root:
```env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bookmyticket
PORT=8080
JWT_SECRET=your_secret_key_here
```

### Step 3 — Start the Database
```bash
docker-compose up -d
```
Verify the container is running:
```bash
docker ps
# Should show book-my-ticket-db-1 with port 5433 mapped
```

### Step 4 — Create Tables
```bash
docker exec -it book-my-ticket-db-1 psql -U postgres -d bookmyticket
```
Then run:
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0,
    booked_by INT REFERENCES users(id)
);

INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 20);
```

### Step 5 — Start the Server
```bash
node index.mjs
```
Server starts on `http://localhost:8080`

---

## API Endpoints

### Auth — `/api/auth`

#### POST `/api/auth/register`
Register a new user.
```json
// Request body
{ "name": "John", "email": "john@example.com", "password": "secret123" }

// Response
{ "message": "User registered.", "user": { "id": 1, "email": "john@example.com" } }
```

#### POST `/api/auth/login`
Login and receive a JWT token.
```json
// Request body
{ "email": "john@example.com", "password": "secret123" }

// Response
{ "message": "Login successful.", "token": "<JWT_TOKEN>" }
```

### Seats

#### GET `/seats`
Get all seats. Public — no auth required.

#### PUT `/:id/:name` — Protected
Book a specific seat. Requires JWT token.
```
Authorization: Bearer <JWT_TOKEN>

PUT /3/John  →  Books seat 3 for name "John"
```

---

## Authentication Flow

```
Register  →  bcrypt hashes password  →  stored in users table
Login     →  bcrypt compares password  →  JWT token issued
Book Seat →  middleware verifies JWT  →  req.user.id attached  →  seat booked
```

---

## Architecture

```
Router → Controller → Service → Model (SQL) → Database
```

- **Router** — defines endpoints, maps to controller
- **Controller** — handles req/res, calls service
- **Service** — business logic (hashing, JWT)
- **Model** — raw SQL queries
- **db/index.js** — single shared pg.Pool

---

## Notes

- All existing starter code endpoints are preserved and unmodified
- Seat bookings use `FOR UPDATE` transactions to prevent race conditions
- Passwords are never stored in plain text
- JWT tokens expire after 1 day
- `.env` file is gitignored — never commit secrets
