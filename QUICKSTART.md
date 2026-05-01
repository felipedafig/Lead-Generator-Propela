# Propela Quick Start Guide

Get Propela running in 5 minutes! 🚀

## Windows Setup

### 1. Prerequisites Check
```powershell
node --version  # Should be v18+
npm --version   # Should be v9+
```

If not installed, download from [nodejs.org](https://nodejs.org/)

### 2. Install & Run

```powershell
# Open PowerShell as Administrator
cd C:\dev\Personal\PropelaClientAquisition

# Install all dependencies
npm run install-all

# Start the backend (keep this running)
npm run dev

# In another PowerShell window, start the frontend
cd frontend
npm run dev
```

### 3. Access the Application
- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/api/health

### 4. Create Your Account
1. Click "Solicitar acesso"
2. Fill in your details
3. Start scraping!

---

## macOS/Linux Setup

### 1. Prerequisites
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

### 2. Install & Run

```bash
cd ~/path/to/propela

# Install all dependencies
npm run install-all

# Start backend (Terminal 1)
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

### 3. Access
- Frontend: http://localhost:3000
- API: http://localhost:5000/api/health

---

## Features to Try

### 1. **Create Account**
- Go to http://localhost:3000
- Sign up with your email

### 2. **Start Scraping**
- Click "Web Scraper" in the sidebar
- Select Miami + Hotel
- Set minimum 3 reviews
- Click "Iniciar Coleta"
- Watch real-time progress

### 3. **Manage Leads**
- View scraped leads in "Meus Leads"
- Filter by industry and status
- Edit lead information
- Add notes and change status

### 4. **Export Data**
- In "Meus Leads" click "Exportar XLSX"
- Download all leads as Excel file

### 5. **View Dashboard**
- See real-time statistics
- Total leads, contacted, and average reviews
- Quick action buttons

---

## Mock Data Available

The demo uses pre-loaded data for these cities/industries:

**Hotels:**
- Miami (8 hotels)
- New York (8 hotels)  
- Los Angeles (8 hotels)

**Property Managers:**
- Miami (5 managers)
- New York (5 managers)
- Los Angeles (5 managers)

---

## Test Scenarios

### Scenario 1: Find New Leads
1. Go to Scraper
2. Select "Los Angeles" + "Hotel"
3. Set min_reviews to 5
4. Complete: Find 6 hotel leads

### Scenario 2: Filter & Export
1. Go to Leads
2. Filter by "hotel" industry
3. Click Export XLSX
4. Complete: Download Excel with all hotels

### Scenario 3: Track Status
1. Go to Leads
2. Edit a lead
3. Change status to "contacted"
4. Add notes
5. Save

---

## Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Dashboard | Cmd+1 / Ctrl+1 |
| Leads | Cmd+2 / Ctrl+2 |
| Scraper | Cmd+3 / Ctrl+3 |
| Settings | Cmd+4 / Ctrl+4 |

---

## Troubleshooting

### Port 5000 already in use
```bash
# Find what's using it
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Port 3000 already in use
```bash
# Start on different port
cd frontend && PORT=3001 npm run dev
```

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules frontend/node_modules
npm cache clean --force
npm run install-all
```

### Database issues
```bash
# Reset database
rm propela.db

# Restart application
npm run dev
```

---

## File Structure Quick Reference

```
propela/
├── server/              # Node.js API
│   ├── index.js        # Main server
│   ├── routes/         # API endpoints
│   └── services/       # Business logic
├── frontend/           # React app
│   └── src/
│       ├── pages/      # Page components
│       └── components/ # Reusable UI
├── propela.db         # SQLite database
└── README.md          # Full documentation
```

---

## Environment Variables

Default `.env` for local development:
```
PORT=5000
JWT_SECRET=local-dev-key
NODE_ENV=development
```

---

## API Endpoints Cheat Sheet

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Leads (requires token)
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN"

# Start Scraping Task
curl -X POST http://localhost:5000/api/scraping/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"city":"Miami","industry":"hotel","min_reviews":3}'
```

---

## Next Steps

1. ✅ Get app running locally
2. 🎯 Test all features
3. 📝 Review [DEPLOYMENT.md](./DEPLOYMENT.md) for VPS setup
4. 🔑 Get Google Maps API key (optional)
5. 🚀 Deploy to production

---

## Performance Tips

- Clear browser cache if styles look wrong: Cmd+Shift+R / Ctrl+Shift+R
- Check browser console for API errors: F12
- Monitor backend logs for scraping issues
- Keep only 1-2 scraping tasks running at once

---

## Support

- 📖 Full docs: [README.md](./README.md)
- 🚀 Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Issues: Check logs first
- 💬 Questions: support@propela.com

---

**Enjoy Propela! 🎉**
