<<<<<<< HEAD
# CommunityPulse Backend API

Smart Resource Allocation - Data-Driven Volunteer Coordination for Social Impact

Built with **Node.js, Express, and MongoDB** (the MERN backend).

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

### 3. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas:

```bash
# Local MongoDB
mongod

# Or set MONGODB_URI in .env for MongoDB Atlas
```

### 4. Seed the Database

```bash
npm run seed
```

### 5. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server runs at: **http://localhost:5000**

---

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── needController.js     # Community needs CRUD
│   ├── volunteerController.js # Volunteer management
│   ├── taskController.js     # Task management & assignment
│   ├── surveyController.js   # Field reports & surveys
│   └── matchingController.js # Smart matching engine
├── middleware/
│   ├── auth.js               # JWT auth & role authorization
│   └── errorHandler.js       # Global error handling
├── models/
│   ├── User.js               # User schema (admin, coordinators)
│   ├── Need.js               # Community needs schema
│   ├── Volunteer.js          # Volunteer profile schema
│   ├── Task.js               # Task schema
│   └── Survey.js             # Survey/field report schema
├── routes/
│   ├── auth.js               # /api/auth/*
│   ├── needs.js              # /api/needs/*
│   ├── volunteers.js         # /api/volunteers/*
│   ├── tasks.js              # /api/tasks/*
│   ├── surveys.js            # /api/surveys/*
│   └── matching.js           # /api/matching/*
├── utils/
│   └── matchingAlgorithm.js  # Smart matching scoring engine
├── .env.example              # Environment template
├── package.json
├── seed.js                   # Database seeder
└── server.js                 # Entry point
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| PUT | `/api/auth/change-password` | Private | Change password |

### Community Needs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/needs` | Public | List all needs (filterable) |
| GET | `/api/needs/stats` | Public | Get need statistics |
| GET | `/api/needs/getcriticalneeds` | Public | Get Critical needs Details |
| GET | `/api/needs/:id` | Public | Get single need |
| POST | `/api/needs` | Admin/Coord/FW | Create need |
| PUT | `/api/needs/:id` | Admin/Coord | Update need |
| PUT | `/api/needs/:id/verify` | Admin/Coord | Verify need |
| DELETE | `/api/needs/:id` | Admin | Delete need |

### Volunteers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/volunteers` | Public | List volunteers (filterable) |
| GET | `/api/volunteers/stats` | Public | Get volunteer stats |
| GET | `/api/volunteers/:id` | Public | Get single volunteer |
| POST | `/api/volunteers` | Public | Register as volunteer |
| PUT | `/api/volunteers/:id` | Private | Update profile |
| PATCH | `/api/volunteers/:id/status` | Private | Update status |
| POST | `/api/volunteers/:id/rate` | Admin/Coord | Rate volunteer |
| DELETE | `/api/volunteers/:id` | Admin | Remove volunteer |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | Public | List all tasks |
| GET | `/api/tasks/board` | Public | Get Kanban board |
| GET | `/api/tasks/:id` | Public | Get single task |
| POST | `/api/tasks` | Admin/Coord | Create task |
| PUT | `/api/tasks/:id` | Admin/Coord | Update task |
| POST | `/api/tasks/:id/assign` | Admin/Coord | Assign volunteer |
| POST | `/api/tasks/:id/unassign` | Admin/Coord | Unassign volunteer |
| POST | `/api/tasks/:id/complete` | Admin/Coord | Complete task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Surveys / Field Reports
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/surveys` | Public | List all reports |
| GET | `/api/surveys/stats` | Public | Get report stats |
| GET | `/api/surveys/:id` | Public | Get single report |
| POST | `/api/surveys` | Optional | Submit field report |
| PUT | `/api/surveys/:id/verify` | Admin/Coord | Verify report |
| DELETE | `/api/surveys/:id` | Admin | Delete report |

### Smart Matching
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/matching/need/:needId` | Public | Match volunteers to a need |
| POST | `/api/matching/all` | Public | Match all needs & volunteers |
| POST | `/api/matching/volunteer/:volId` | Public | Find needs for volunteer |
| POST | `/api/matching/confirm` | Admin/Coord | Confirm assignment |

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all endpoints |
| `coordinator` | Create/edit needs, tasks, assign volunteers, verify |
| `field-worker` | Create needs, submit reports |
| `volunteer` | Update own profile, change status |
| `viewer` | Read-only access |

---

## 🤖 Smart Matching Algorithm

The matching engine scores volunteer-need pairs using weighted criteria:

| Factor | Max Points | Description |
|--------|-----------|-------------|
| Category Preference | 35 | Volunteer's preferred categories |
| Skill Relevance | 45 | Skills matched to need category |
| Geographic Proximity | 20 | Same region bonus |
| Urgency Priority | 10 | Critical/high urgency bonus |
| Experience | 10 | Past tasks completed |
| Availability | 8 | Full-time/flexible bonus |
| Rating | 10 | Volunteer quality rating |

**Minimum match score: 30/100** for a recommendation.

---

## 🔧 Query Parameters

### Filtering (GET endpoints)
```
GET /api/needs?category=healthcare&urgency=critical&region=North Zone
GET /api/volunteers?status=active&skill=Medical&search=john
GET /api/tasks?status=in-progress&category=food
GET /api/surveys?verified=true&category=education
```

### Pagination
```
GET /api/needs?page=1&limit=20
```

### Sorting
```
GET /api/needs?sort=-reportedDate    # Newest first
GET /api/volunteers?sort=-rating     # Highest rated
GET /api/tasks?sort=deadline          # Earliest deadline
```

### Text Search
```
GET /api/needs?search=water+contamination
GET /api/volunteers?search=medical
```

---

## 🔑 Authentication

Include the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/me
```

---

## 📊 Example API Calls

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@CommunityPulse.org","password":"admin123"}'
```

### Create a Need
```bash
curl -X POST http://localhost:5000/api/needs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Water Supply",
    "category": "healthcare",
    "urgency": "critical",
    "location": "Riverside District",
    "region": "North Zone",
    "description": "Urgent need for clean water",
    "affectedPeople": 5000,
    "source": "field-report",
    "volunteersNeeded": 20
  }'
```

### Run Smart Matching
```bash
curl -X POST "http://localhost:5000/api/matching/all?minScore=40&maxPerNeed=5" \
  -H "Authorization: Bearer TOKEN"
```

### Submit Field Report
```bash
curl -X POST http://localhost:5000/api/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "submittedBy": "Field Worker - John",
    "location": "South Ward",
    "category": "food",
    "description": "Food supplies critically low",
    "affectedCount": 2000,
    "urgency": "critical"
  }'
```

---

## 🧪 Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@CommunityPulse.org | admin123 |
| Coordinator | sarah@CommunityPulse.org | password123 |
| Field Worker | raj@CommunityPulse.org | password123 |

---

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (JSON Web Tokens) + bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Morgan
=======
# Community-Pulse-Backend
>>>>>>> c601a0b67d30c340a50305db0bdd81b3c6832cc0
