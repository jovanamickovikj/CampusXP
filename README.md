# CampusXP

A gamified university social platform where students earn XP and points for academic activity, spend them in a virtual shop, and connect with peers and verified campus merchants.

---

## Features

- **Authentication** — JWT-based register/login with BCrypt password hashing
- **Two account types** — regular students and shop managers (require admin verification)
- **XP & Points system** — earn points for posts, spend them in the shop, track history
- **Posts** — create, archive, and feed posts with optional file attachments (image/video/document)
- **Friendships** — send/accept/cancel/decline friend requests between students
- **Following** — students follow verified shop managers
- **Leaderboard** — ranked by XP across all users
- **Badges** — award badges to users
- **Virtual Shop** — shop managers list items; students purchase with points
- **Admin panel** — approve/reject shop manager applications, manage users
- **File uploads** — stored on disk, served as static files

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.5, Java 21 |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL (prod), H2 (dev) |
| Migrations | Flyway V1–V8 |
| Security | Spring Security + JJWT 0.12.x |
| Validation | Jakarta Bean Validation (`spring-boot-starter-validation`) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Build tool | Maven |

---

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+ & npm
- PostgreSQL 15+ (for production)

---

## Quick Start (Development)

Development uses an **H2 in-memory database** — no PostgreSQL needed.

### 1. Backend

```bash
cd CampusXP
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The API starts on `http://localhost:8081`.

### 2. Frontend

```bash
cd CampusXP/frontend
npm install
npm run dev
```

The UI starts on `http://localhost:5173` and proxies `/api` to the backend.

---

## Production Setup

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DB_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/campusxp` |
| `DB_USERNAME` | Database user | `campusxp_user` |
| `DB_PASSWORD` | Database password | *(strong password)* |
| `JWT_SECRET` | JWT signing key (min 32 chars) | *(random string)* |

### Database

```sql
CREATE USER campusxp_user WITH PASSWORD 'your_password';
CREATE DATABASE campusxp OWNER campusxp_user;
```

Flyway will run all migrations automatically on startup.

### Build & Run

```bash
# Build fat JAR
mvn clean package -DskipTests

# Run with prod profile
export DB_URL=jdbc:postgresql://localhost:5432/campusxp
export DB_USERNAME=campusxp_user
export DB_PASSWORD=your_password
export JWT_SECRET=your_32_char_secret

java -jar target/campusxp-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Build Frontend

```bash
cd frontend
npm run build
# Outputs to frontend/dist — serve with nginx or embed in Spring Boot's static folder
```

### Health Check

```
GET /actuator/health
```

Returns `{"status":"UP"}` — suitable for load balancer probes.

---

## Project Structure

```
CampusXP/
├── src/main/java/mk/ukim/finki/campusxp/
│   ├── config/         # Security config, CORS, static file serving
│   ├── controller/     # REST controllers (AuthController, UserController, …)
│   ├── dto/            # Request/Response records + Mapper
│   │   ├── request/    # Validated request records (Bean Validation annotations)
│   │   └── response/   # Response records (never expose entity internals)
│   ├── exception/      # GlobalExceptionHandler (@RestControllerAdvice)
│   ├── model/          # JPA entities (User, Post, Friendship, Follow, …)
│   ├── repository/     # Spring Data JPA repositories
│   ├── security/       # JwtUtil, JwtAuthFilter, UserDetailsService impl
│   └── service/        # Business logic (all methods @Transactional)
├── src/main/resources/
│   ├── application.properties          # Shared config
│   ├── application-dev.properties      # H2 dev config
│   ├── application-prod.properties     # PostgreSQL + HikariCP prod config
│   └── db/migration/                   # Flyway migrations V1–V8
└── frontend/
    ├── src/
    │   ├── pages/       # Full-page React components
    │   ├── components/  # Shared UI components (Avatar, UserListModal, …)
    │   ├── api/         # Fetch helpers (auth.js, posts.js, friendships.js, …)
    │   └── context/     # AuthContext (JWT state)
    └── vite.config.js   # Dev proxy → localhost:8081
```

---

## API Overview

All endpoints (except `/api/auth/**` and `/uploads/**`) require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (USER or SHOP_MANAGER) |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/users/{id}/profile` | Full profile (posts, friends/followers count, badges) |
| PUT | `/api/users/{id}` | Update profile |
| GET | `/api/posts/feed/{userId}` | Posts from friends/followed managers |
| POST | `/api/posts` | Create post (with optional file URL) |
| GET | `/api/friendships/friends/{userId}` | Friend list |
| POST | `/api/friendships/request` | Send friend request |
| PUT | `/api/friendships/{id}/accept` | Accept request |
| DELETE | `/api/friendships/{id}` | Unfriend / cancel / decline |
| POST | `/api/follows` | Follow a shop manager |
| DELETE | `/api/follows/{followId}` | Unfollow |
| GET | `/api/shop/items` | List active shop items |
| POST | `/api/shop/purchase` | Purchase item with points |
| GET | `/api/leaderboard` | Top users by XP |
| POST | `/api/upload` | Upload a file → returns URL |
| GET | `/actuator/health` | Health probe |

---

## Scalability Notes

The backend is designed to handle **~10,000 concurrent users**:

- **HikariCP** pool: 20 max connections, 5 idle minimum, keep-alive enabled
- **Database indexes** (V8 migration): all foreign keys, `username`, `email`, `archived`, and common composite columns indexed
- **`@Transactional(readOnly=true)`** on all read paths — Hibernate skips dirty-checking, PostgreSQL can route to read replicas
- **Count queries** instead of loading collections (e.g., post count uses `COUNT(*)` not `findAll().size()`)
- **Hibernate batch inserts** (`hibernate.jdbc.batch_size=25`) for bulk operations
- Stateless JWT auth — no server-side session state, horizontally scalable

---

## Security

- Passwords hashed with **BCrypt** (Spring Security default, cost factor 10)
- JWT signed with **HS256**, configurable expiry (default 24 h)
- JWT secret loaded from `JWT_SECRET` env var — never hard-coded in production
- Input validated with **Bean Validation** on all request bodies; `GlobalExceptionHandler` returns structured 400 errors
- SQL injection prevented by Spring Data JPA parameterized queries
- CORS configured to allow only the frontend origin

---

## Default Admin Account

On first run (dev profile), you can register a user and manually set `role = 'ADMIN'` in the H2 console at `http://localhost:8081/h2-console`.

In production, promote a user via:

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
```
