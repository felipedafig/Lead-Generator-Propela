# Propela Architecture Documentation

## System Overview

Propela is a full-stack web application built with modern technologies for high-efficiency lead generation and management.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TIER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          React SPA (Port 3000)                       │  │
│  │  - Landing Page / Auth Pages                         │  │
│  │  - Dashboard, Leads, Scraper, Settings              │  │
│  │  - Tailwind CSS Styling                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  API TIER (Nginx Proxy)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Reverse Proxy & Load Balancer               │  │
│  │  - Routes /api/* to Node.js backend                 │  │
│  │  - SSL/TLS Termination                              │  │
│  │  - Static file serving (React build)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION TIER (Port 5000)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Express.js REST API (Node.js)                 │  │
│  │                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │  │
│  │  │   Auth      │  │   Leads     │  │  Scraping  │ │  │
│  │  │  Routes     │  │  Routes     │  │  Routes    │ │  │
│  │  └─────────────┘  └─────────────┘  └────────────┘ │  │
│  │         ↓              ↓                 ↓          │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │    Middleware Layer (Auth, Validation)      │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  │         ↓                                          │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │      Services (Business Logic)               │ │  │
│  │  │  - User authentication                       │ │  │
│  │  │  - Lead CRUD operations                      │ │  │
│  │  │  - Web scraping engine                       │ │  │
│  │  │  - Export generation                         │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               DATA TIER                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    SQLite Database (propela.db)                     │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │ users    │  │ leads    │  │ scraping_tasks   │ │  │
│  │  │ ────────  │  │ ────────  │  │ ────────────────  │ │  │
│  │  │ id       │  │ id       │  │ id               │ │  │
│  │  │ email    │  │ user_id  │  │ user_id          │ │  │
│  │  │ password │  │ company  │  │ city             │ │  │
│  │  │ name     │  │ owner    │  │ industry         │ │  │
│  │  │ created  │  │ phone    │  │ min_reviews      │ │  │
│  │  │          │  │ status   │  │ status           │ │  │
│  │  └──────────┘  └──────────┘  │ total_leads      │ │  │
│  │                               │ created_at       │ │  │
│  │                               │ completed_at     │ │  │
│  │                               └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Services
├── Google Maps API (optional, for real scraping)
├── Let's Encrypt (SSL certificates)
└── Email Service (notifications)
```

## Component Architecture

### Frontend (React)

**Directory Structure:**
```
frontend/src/
├── App.jsx                 # Main router component
├── index.css              # Global Tailwind styles
├── main.jsx               # React entry point
├── pages/                 # Page-level components
│   ├── LandingPage.jsx    # Marketing homepage
│   ├── Login.jsx          # User login form
│   ├── Register.jsx       # User registration form
│   ├── Dashboard.jsx      # Main dashboard/statistics
│   ├── Leads.jsx          # Lead management interface
│   ├── Scraper.jsx        # Web scraping interface
│   └── Settings.jsx       # User settings
└── components/            # Reusable components
    ├── Sidebar.jsx        # Navigation sidebar
    └── StatCard.jsx       # Statistics display card
```

**Authentication Flow:**
```
User Input (Email/Password)
        ↓
Form Submission
        ↓
API Request to /api/auth/login
        ↓
Backend Validation
        ↓
JWT Token Generated
        ↓
Token stored in localStorage
        ↓
Redirect to /dashboard
```

**Lead Management Flow:**
```
Fetch Leads
    ↓
Apply Filters (search, industry, status)
    ↓
Display in Table
    ↓
User Actions:
├─ Edit: Update form fields
├─ Delete: Confirm & remove
├─ Export: Generate XLSX file
└─ Add: Create new lead
```

### Backend (Node.js + Express)

**Directory Structure:**
```
server/
├── index.js               # Express app initialization
├── db.js                  # Database setup & connection
├── middleware/
│   └── auth.js           # JWT authentication
├── routes/               # API endpoints
│   ├── auth.js           # Login/Register endpoints
│   ├── leads.js          # Lead CRUD operations
│   └── scraping.js       # Scraping task management
└── services/             # Business logic layer
    └── scraper.js        # Web scraping implementation
```

**Request-Response Cycle:**
```
HTTP Request
    ↓
Express Middleware
├─ CORS
├─ JSON parsing
└─ Authentication (if protected)
    ↓
Route Handler
    ↓
Service Layer (Business Logic)
    ↓
Database Operations (SQLite)
    ↓
Response Generation (JSON/XLSX)
    ↓
HTTP Response
```

**Authentication System:**
```
1. User Registration
   ├─ Receive: email, password, name
   ├─ Hash password with bcryptjs
   ├─ Store in database
   └─ Return JWT token

2. User Login
   ├─ Receive: email, password
   ├─ Query database for user
   ├─ Compare password hash
   └─ Generate JWT token if valid

3. Protected Routes
   ├─ Client includes token in Authorization header
   ├─ Middleware verifies JWT signature
   ├─ Extract user info from token
   └─ Attach to request object
```

### Database Design

**Users Table:**
- Stores user authentication data
- Relationship: One-to-many with leads and scraping_tasks

**Leads Table:**
- Stores all lead information
- Foreign key to users table
- Filterable by industry and status
- Supports XLSX export

**Scraping_Tasks Table:**
- Tracks background scraping operations
- Status: pending → processing → completed/failed
- Stores results (total_leads, timestamps)

**Query Examples:**
```sql
-- Get all leads for a user
SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC

-- Filter by industry
SELECT * FROM leads WHERE user_id = ? AND industry = ? 

-- Get scraping task progress
SELECT * FROM scraping_tasks WHERE user_id = ? ORDER BY created_at DESC

-- Calculate statistics
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
  AVG(CAST(review_count AS FLOAT)) as avg_reviews
FROM leads WHERE user_id = ?
```

## Data Flow

### Scraping Operation Flow

```
User initiates scraping
    ↓
POST /api/scraping/tasks
    ├─ Validate inputs (city, industry)
    └─ Create task in database (status: pending)
    ↓
Background Process Starts
    ├─ Update task status to "processing"
    ├─ Query scraper service (Google Maps / Mock data)
    ├─ For each lead found:
    │  └─ INSERT into leads table
    ├─ Update task with total_leads count
    └─ Mark as completed (status: completed)
    ↓
Frontend Polls Task Status
    ├─ GET /api/scraping/tasks/:id
    └─ Update UI with progress
    ↓
User Views Results
    └─ GET /api/leads (filtered by scraped data)
```

### Lead Export Flow

```
User clicks "Exportar XLSX"
    ↓
GET /api/leads/export/xlsx?industry=hotel
    ├─ Query database for matching leads
    └─ Apply user's filters
    ↓
ExcelJS Library
    ├─ Create workbook
    ├─ Add worksheet
    ├─ Format headers (bold, black background)
    └─ Populate data rows
    ↓
Generate Binary File
    ├─ Create blob
    └─ Set headers for download
    ↓
Browser Downloads
    └─ propela-leads.xlsx
```

## Technology Stack Details

### Frontend Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI Framework | 18.2+ |
| React Router | Navigation | 6.19+ |
| Axios | HTTP Client | 1.6+ |
| Tailwind CSS | Styling | 3.3+ |
| Vite | Build Tool | 5.0+ |
| Lucide React | Icons | 0.292+ |

**Why These Choices:**
- React: Industry standard, large ecosystem
- Tailwind: Utility-first CSS, rapid development
- Vite: Fast build, great DX
- Axios: Simple HTTP client, good for APIs

### Backend Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| Node.js | Runtime | 18+ |
| Express | Web Framework | 4.18+ |
| SQLite | Database | 5.1+ |
| bcryptjs | Password Hashing | 2.4+ |
| jsonwebtoken | JWT Auth | 9.1+ |
| ExcelJS | XLSX Generation | 4.3+ |
| Axios | HTTP Client | 1.6+ |
| Cheerio | HTML Parsing | 1.0+ |

**Why These Choices:**
- Express: Lightweight, fast, flexible
- SQLite: Simple setup, zero configuration
- bcryptjs: Industry standard password hashing
- ExcelJS: Complete XLSX generation

## Security Architecture

### Authentication & Authorization

```
Browser                                Server
   │                                    │
   ├─ POST /auth/login                 │
   │  (email, password)  ──────────────>
   │                                    ├─ Hash password
   │                                    ├─ Compare with DB
   │                                    └─ Generate JWT
   │  <────────────── JWT Token         │
   │  (stored in localStorage)          │
   │                                    │
   ├─ GET /api/leads                    │
   │  + "Authorization: Bearer JWT" ──>
   │                                    ├─ Verify JWT
   │                                    ├─ Extract user_id
   │                                    └─ Query DB
   │  <────────────── Lead Data         │
```

### Security Measures

1. **Password Security**
   - Hashed with bcryptjs (10 salt rounds)
   - Never stored in plain text
   - Compared safely to prevent timing attacks

2. **Token Security**
   - JWT signed with secret key
   - Expiration: 7 days
   - Stored in localStorage (httpOnly possible in production)
   - Sent in Authorization header

3. **Database Security**
   - SQL injection prevention (parameterized queries)
   - Foreign key constraints enabled
   - User-data isolation (WHERE user_id = ?)

4. **API Security**
   - CORS configured
   - Request validation
   - Rate limiting (can be added)
   - HTTPS in production

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - React Router lazy loading
   - Component-level code splitting

2. **Caching**
   - Browser cache for static assets
   - HTTP cache headers

3. **Rendering**
   - React memo for expensive components
   - useCallback for stable function references

### Backend Optimization

1. **Database**
   - Indexes on frequently queried columns
   - Query optimization with EXPLAIN
   - Connection pooling

2. **API Responses**
   - JSON compression
   - Pagination for large datasets
   - Caching headers

3. **Scraping**
   - Parallel processing capability
   - Rate limiting to avoid blocks
   - Retry logic for failed requests

## Scalability Considerations

### Current Setup (SQLite)
- Suitable for: <10K leads, 1-10 concurrent users
- Single server deployment

### Scaling to PostgreSQL
```javascript
// Switch database driver
import pg from 'pg'
// Update connection pooling
// Add read replicas for scaling reads
```

### Load Balancing
```
                    Nginx (Load Balancer)
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
            Node.js 1   Node.js 2   Node.js 3
                │           │           │
                └───────────┼───────────┘
                            │
                    Shared Database (PostgreSQL)
                    + Redis Cache
```

### Caching Strategy
```
User Request
    ↓
Check Redis Cache
    ├─ Cache Hit: Return cached data
    └─ Cache Miss: Query DB
         ↓
    Store in Redis (with TTL)
         ↓
    Return to user
```

## Error Handling

### Error Types

1. **Validation Errors** (400)
   - Missing required fields
   - Invalid email format
   - Password too short

2. **Authentication Errors** (401/403)
   - Invalid credentials
   - Expired token
   - Missing authorization

3. **Not Found Errors** (404)
   - Lead not found
   - Task not found
   - User not found

4. **Server Errors** (500)
   - Database connection failed
   - Unexpected exceptions
   - Service unavailable

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional detailed information
}
```

## Monitoring & Logging

### Logging Strategy

1. **API Requests**
   - Request method, path, status
   - Response time
   - User ID (if authenticated)

2. **Database Operations**
   - Query execution time
   - Number of rows affected
   - Errors

3. **Background Tasks**
   - Task start/completion
   - Progress updates
   - Error tracking

### Metrics to Monitor

```
Performance
├─ API Response Time
├─ Database Query Time
├─ Page Load Time
└─ Scraping Speed (leads/minute)

User Behavior
├─ Active Users
├─ Scraping Tasks Per Day
├─ Export Downloads
└─ Feature Usage

System Health
├─ Memory Usage
├─ Disk Space
├─ Database Size
└─ Error Rate
```

## Deployment Pipeline

```
Code Commit (Git)
    ↓
[Optional] Run Tests
    ↓
Build Frontend (npm run build)
    ├─ Vite bundling
    ├─ Asset optimization
    └─ Source maps generation
    ↓
Build Backend
    └─ Copy to server
    ↓
Database Migration
    └─ Create tables if needed
    ↓
Start Application (PM2)
    ├─ Node cluster mode
    ├─ Auto-restart on failure
    └─ Log monitoring
    ↓
Health Check
    └─ Verify API responding
    ↓
Switch Traffic (Nginx)
    └─ Route to new version
```

## Future Enhancements

### Immediate
- [ ] Email notifications for completed scraping
- [ ] Advanced filtering and search
- [ ] Bulk lead import/update
- [ ] Custom fields for leads

### Short Term
- [ ] Real Google Maps API integration
- [ ] Web crawler with Puppeteer
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API rate limiting

### Long Term
- [ ] Mobile app (React Native)
- [ ] Machine learning lead scoring
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Multi-tenant architecture
- [ ] Enterprise features (SSO, audit logs)

---

This architecture is designed to be simple yet scalable, following industry best practices while remaining easy to understand and modify.
