# 🚗 RentEase — Car Rental Management Platform

A fully functional car rental platform with **Express.js REST API backend**, **JWT authentication**, **real-time booking validation**, and a **role-based dashboard** for customers, vendors, and admins.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
open http://localhost:3000
```

---

## 🔑 Demo Accounts

| Role     | Email                   | Password    |
|----------|-------------------------|-------------|
| Admin    | admin@rentease.in       | admin123    |
| Vendor   | vendor@rentease.in      | vendor123   |
| Customer | priya@example.com       | user123     |

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | /api/auth/register   | Register new user   |
| POST   | /api/auth/login      | Login, get JWT      |
| GET    | /api/auth/me         | Current user info   |

### Vehicles
| Method | Endpoint              | Auth         | Description              |
|--------|-----------------------|--------------|--------------------------|
| GET    | /api/vehicles         | Public       | List all vehicles        |
| GET    | /api/vehicles/:id     | Public       | Get single vehicle       |
| POST   | /api/vehicles         | Vendor/Admin | Add vehicle              |
| PUT    | /api/vehicles/:id     | Vendor/Admin | Update vehicle           |
| DELETE | /api/vehicles/:id     | Vendor/Admin | Remove vehicle           |

### Bookings
| Method | Endpoint                     | Auth         | Description              |
|--------|------------------------------|--------------|--------------------------|
| GET    | /api/bookings                | Any logged   | List bookings (filtered) |
| POST   | /api/bookings                | Customer     | Create booking           |
| PUT    | /api/bookings/:id/status     | Vendor/Admin | Update booking status    |
| DELETE | /api/bookings/:id            | Any logged   | Cancel booking           |

### Vendor
| Method | Endpoint                | Auth   | Description          |
|--------|-------------------------|--------|----------------------|
| GET    | /api/vendor/dashboard   | Vendor | Dashboard stats      |

### Admin
| Method | Endpoint                | Auth  | Description          |
|--------|-------------------------|-------|----------------------|
| GET    | /api/admin/dashboard    | Admin | Platform-wide stats  |
| GET    | /api/admin/vendors      | Admin | All vendors          |
| PUT    | /api/admin/vendors/:id  | Admin | Update vendor        |
| GET    | /api/admin/users        | Admin | All users            |

### Public
| Method | Endpoint    | Description       |
|--------|-------------|-------------------|
| GET    | /api/stats  | Platform stats    |

---

## 🗄️ Migrating to a Real Database

The backend uses an in-memory store (`db` object in `server.js`).  
To migrate to **PostgreSQL / MySQL / SQLite**:

1. Install your preferred ORM: `npm install prisma` or `npm install sequelize`
2. Replace `db.*` operations with SQL queries
3. The API surface stays exactly the same

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire after 7 days
- Role-based middleware on all protected routes
- Server-side double-booking validation (not just frontend)

---

## 🏗️ Architecture

```
rentease/
├── server.js          # Express backend — REST API
├── public/
│   └── index.html     # Frontend SPA
└── package.json
```

---

## ⚙️ Environment Variables

| Variable    | Default                          | Description       |
|-------------|----------------------------------|-------------------|
| PORT        | 3000                             | Server port       |
| JWT_SECRET  | rentease_jwt_secret_2026         | JWT signing key   |

```bash
PORT=8080 JWT_SECRET=your_secret npm start
```
