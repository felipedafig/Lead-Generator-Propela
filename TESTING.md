# Propela Testing Guide

Complete testing procedures for the Propela platform.

## Test Environment Setup

```bash
# Start services
npm run dev                    # Terminal 1 - Backend
cd frontend && npm run dev     # Terminal 2 - Frontend

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: propela.db
```

## Unit Testing

### Backend API Tests

#### Authentication Tests

```bash
# Test 1: User Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Expected: 201 Created with token

# Test 2: User Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Expected: 200 OK with JWT token

# Test 3: Invalid Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'

# Expected: 401 Unauthorized

# Test 4: Duplicate Email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "test@example.com",
    "password": "Pass123"
  }'

# Expected: 400 Bad Request - "Email already registered"
```

#### Leads API Tests

```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}' \
  | jq -r '.token')

# Test 1: Get All Leads
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with array of leads

# Test 2: Create Lead
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Hotel",
    "owner_name": "John Doe",
    "phone_number": "(555) 123-4567",
    "email": "info@testhotel.com",
    "city": "Miami",
    "industry": "hotel",
    "review_count": 150,
    "rating": 4.5
  }'

# Expected: 201 Created with lead object

# Test 3: Update Lead
LEAD_ID=1  # From previous response
curl -X PUT http://localhost:5000/api/leads/$LEAD_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted", "notes": "Follow up tomorrow"}'

# Expected: 200 OK with updated lead

# Test 4: Delete Lead
curl -X DELETE http://localhost:5000/api/leads/$LEAD_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with success message
```

#### Scraping API Tests

```bash
# Test 1: Get Scraping Tasks
curl http://localhost:5000/api/scraping/tasks \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with array of tasks

# Test 2: Create Scraping Task
curl -X POST http://localhost:5000/api/scraping/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Miami",
    "industry": "hotel",
    "min_reviews": 3
  }'

# Expected: 201 Created with task object including task_id

# Test 3: Get Task Status
TASK_ID=1  # From previous response
curl http://localhost:5000/api/scraping/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with task status and progress
```

## Integration Testing

### User Journey 1: Complete Lead Scraping Workflow

1. **Register New User**
   - Go to http://localhost:3000
   - Click "Solicitar acesso"
   - Fill form: Name, Email, Password
   - Verify: Redirected to dashboard

2. **Start Scraping**
   - Click "Web Scraper" in sidebar
   - Select "Miami" city
   - Select "hotel" industry
   - Set min_reviews to 5
   - Click "Iniciar Coleta"
   - Verify: Task appears with "processing" status

3. **Monitor Progress**
   - Wait for status to change to "completed"
   - Verify: leads count appears (should be 6)

4. **View Leads**
   - Click "Meus Leads"
   - Verify: New leads appear in table
   - Verify: Can see company names, phones, ratings

5. **Filter and Export**
   - Filter by industry "hotel"
   - Click "Exportar XLSX"
   - Verify: Excel file downloads as "propela-leads.xlsx"

6. **Edit Lead**
   - Click edit icon on a lead
   - Change status to "contacted"
   - Add note: "Initial contact made"
   - Click Save
   - Verify: Lead updates in table

### User Journey 2: Multi-City Comparison

1. **Scrape Multiple Cities**
   - Scrape Miami hotels (6 leads)
   - Scrape New York hotels (8 leads)
   - Scrape Los Angeles hotels (8 leads)

2. **Filter Analysis**
   - Filter by Los Angeles only
   - Verify: Shows 8 LA hotels
   - Remove filter
   - Verify: Shows all 22 leads

3. **Export Aggregated Data**
   - Export all leads to XLSX
   - Verify: File contains 22 rows + header

### User Journey 3: Account Management

1. **Login/Logout**
   - Register account
   - Logout (click user menu → Sair)
   - Login with same credentials
   - Verify: Access restored to same leads

2. **Settings Update**
   - Go to Settings
   - Add Google Maps API key (optional)
   - Change notification email
   - Click Save
   - Verify: Success message appears

3. **Data Persistence**
   - Create several leads
   - Refresh page (F5)
   - Verify: All leads still visible
   - Check browser localStorage for token

## Frontend Component Testing

### Authentication Pages

```
✓ Landing Page
  └─ Logo displays correctly
  └─ Navigation links work
  └─ CTA buttons link to register/login

✓ Login Page
  └─ Form fields accept input
  └─ Submit button disabled until form filled
  └─ Error message displays for invalid credentials
  └─ Success redirects to dashboard

✓ Register Page
  └─ Password confirmation validation
  └─ Email validation
  └─ Success creates user and logs in
```

### Dashboard Page

```
✓ Header
  └─ User name displays
  └─ Logout button works
  └─ Sidebar toggle works on mobile

✓ Statistics Cards
  └─ Total leads displays correct count
  └─ Contacted leads shows filtered count
  └─ Average reviews calculates correctly

✓ Quick Actions
  └─ "Iniciar Nova Coleta" links to scraper
  └─ "Visualizar Leads" links to leads page
```

### Leads Page

```
✓ Table Display
  └─ All columns visible (Company, Owner, Phone, etc)
  └─ Data loads from API
  └─ Rows are clickable/editable

✓ Filtering
  └─ Search by company name works
  └─ Search by phone works
  └─ Industry dropdown filters correctly
  └─ Status dropdown filters correctly

✓ CRUD Operations
  └─ Add new lead form appears
  └─ Edit modal opens for lead
  └─ Delete confirmation shows
  └─ Status badges display correctly

✓ Export
  └─ Export button downloads file
  └─ File is valid XLSX
  └─ Excel contains correct data
```

### Scraper Page

```
✓ Form
  └─ City dropdown populated
  └─ Industry dropdown populated
  └─ Min reviews input accepts numbers
  └─ Form validation works

✓ Task Creation
  └─ Task appears after submission
  └─ Status updates from pending → processing → completed
  └─ Lead count updates correctly

✓ Task History
  └─ All past tasks display
  └─ Status badges show correct color
  └─ Timestamps format correctly
  └─ Completed count increases
```

### Settings Page

```
✓ Account Section
  └─ Name and email display (read-only)
  └─ Plan info shows "Profissional"

✓ API Configuration
  └─ Google Maps API key field appears
  └─ Field is password type
  └─ Help text links to Google Console

✓ Notifications
  └─ Checkboxes toggle options
  └─ Save button works
  └─ Success message appears
```

## Performance Testing

### Load Testing

```bash
# Simulate multiple concurrent users
# Using Apache Bench (if installed)

ab -n 100 -c 10 http://localhost:5000/api/health

# Expected: <100ms response time
# No errors or timeouts
```

### Database Performance

```bash
# Test with different data sizes
# Create test scenario with 1000+ leads

# Measure query time
sqlite3 propela.db "
  .timer ON
  SELECT COUNT(*) FROM leads;
  SELECT * FROM leads LIMIT 100;
"

# Expected: <100ms for 1000 rows
```

### Frontend Performance

```
Lighthouse Audit (Chrome DevTools)
├─ Performance Score: >80
├─ Accessibility Score: >90
├─ Best Practices Score: >90
├─ SEO Score: >90
└─ Load Time: <2 seconds
```

## Security Testing

### SQL Injection Tests

```bash
# Try to inject SQL via search
curl "http://localhost:5000/api/leads?search='; DROP TABLE leads; --" \
  -H "Authorization: Bearer $TOKEN"

# Expected: SQL error not exposed, data still intact
```

### XSS Tests

```bash
# Try to inject script via lead notes
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "<script>alert(1)</script>",
    "notes": "<img src=x onerror=alert(1)>"
  }'

# Expected: Script tags stored as text, not executed
```

### Authentication Tests

```bash
# Try to access protected route without token
curl http://localhost:5000/api/leads

# Expected: 401 Unauthorized

# Try with expired/fake token
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer fake-token"

# Expected: 403 Forbidden
```

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✓ Fully supported |
| Firefox | Latest | ✓ Fully supported |
| Safari | Latest | ✓ Fully supported |
| Edge | Latest | ✓ Fully supported |
| Mobile Chrome | Latest | ✓ Fully supported |
| Mobile Safari | Latest | ✓ Fully supported |

## Accessibility Testing

```
WCAG 2.1 Level AA Compliance
├─ Keyboard Navigation: All functions accessible via Tab/Enter
├─ Screen Readers: NVDA/JAWS compatible
├─ Color Contrast: >4.5:1 for text
├─ Focus Indicators: Visible focus rings
└─ Form Labels: All inputs have associated labels
```

## Test Checklist

### Pre-Release Testing

- [ ] All API endpoints tested with valid data
- [ ] All API endpoints reject invalid data
- [ ] Authentication flow complete (register → login → access → logout)
- [ ] All CRUD operations work (create, read, update, delete)
- [ ] Export generates valid XLSX file
- [ ] Web scraping completes successfully
- [ ] Dashboard loads and displays stats
- [ ] Mobile responsiveness verified
- [ ] No JavaScript errors in console
- [ ] No SQL errors in logs
- [ ] Database integrity maintained
- [ ] Performance acceptable (<2s page load)
- [ ] Security tests pass (no XSS/SQL injection)
- [ ] Accessibility standards met
- [ ] Browser compatibility verified

### Post-Deployment Testing

- [ ] Production URL accessible
- [ ] SSL/HTTPS working
- [ ] Database persists between restarts
- [ ] Email notifications working
- [ ] Logs rotating correctly
- [ ] Backup strategy tested
- [ ] Monitoring alerts configured
- [ ] Health check endpoint responding

## Known Issues & Workarounds

| Issue | Status | Workaround |
|-------|--------|-----------|
| Database file locking | Known | Restart server |
| Port 5000 in use | Known | Use different port |
| Frontend builds slowly | Known | Use `npm run build` separately |

## Regression Test Suite

Run these tests before each release:

1. **Core Functionality**
   - User registration and login
   - Lead creation and deletion
   - Web scraping task
   - Excel export

2. **Data Integrity**
   - No data loss on page refresh
   - Filters don't corrupt data
   - Concurrent updates handled correctly

3. **Performance**
   - Page loads in <2 seconds
   - API responses in <200ms
   - Export completes in <5 seconds

4. **Security**
   - No unauthorized access
   - Passwords properly hashed
   - Tokens expire correctly

---

Run tests regularly and track results to maintain code quality!
