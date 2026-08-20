# Copper Shop Quality Check - Backend

Node.js + Express + MongoDB backend (same stack as the Fire Safety Checklist project).

## What this gives you
- Real login / signup, with account lockout after 10 failed attempts
- **Forgot password with a real emailed OTP** (not just a demo message) - `/api/auth/forgot-password` and `/api/auth/reset-password`
- Brand -> Model -> FG Code master data, with add/edit/delete for both, stored in MongoDB (`seed.js` loads the list you gave me)
- Part-code "links" per model - each one is a real database record with its own ID. The **shareable link is simply your frontend URL + that ID**, e.g.
  `https://your-app-domain.com/link/64f1a2...` - opening it calls `GET /api/links/:id`
- Photo upload/delete for Suction and Discharge, stored on disk under `/uploads` and referenced from MongoDB (so a photo really is deleted from the database when you delete it)
- **Time tracking**: `POST /api/sessions/start` when a part-code link opens, `POST /api/sessions/:id/end` when the user goes back/closes it. Every open->close is its own row - so if the same part code is opened 5 times in a day, you get 5 rows with start time, end time and duration.
- **Automatic Excel report + email**: add recipient emails via `/api/reports/recipients`, then either call `/api/reports/send` manually or let the built-in daily job (8 PM, see `src/utils/scheduler.js`) email everyone the day's session log as an Excel attachment automatically.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` - free MongoDB Atlas cluster works fine (mongodb.com/atlas)
   - `JWT_SECRET` - any long random string
   - `SMTP_*` - your company mailbox or a transactional email service (SendGrid, AWS SES, etc.). For Gmail you must use an **App Password**, not your normal password.
3. Load the Brand/Model/FG Code master list: `node seed.js`
4. Start the server: `npm run dev` (or `npm start`)
5. Server runs on `http://localhost:5000` by default. All endpoints are under `/api/...`.

## Where the frontend fits in
The HTML demo I sent you earlier is a **UI-only mockup** with data held in the browser's memory (it disappears on refresh). To go live, that frontend needs to be rebuilt (ideally in React, matching the fire-safety project's stack) to call these APIs with `fetch`, e.g.:

```js
// on login
const res = await fetch(`${API_BASE}/api/auth/login`, {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ email, password })
});
const { token } = await res.json();
// save token, send it as: Authorization: Bearer <token> on every later request

// when a part-code link opens
const startRes = await fetch(`${API_BASE}/api/sessions/start`, {
  method:'POST', headers: {...authHeaders,'Content-Type':'application/json'},
  body: JSON.stringify({ partCodeLinkId })
});
const { sessionId } = await startRes.json();
// ...user views/edits the part...
// when they click "Back":
await fetch(`${API_BASE}/api/sessions/${sessionId}/end`, { method:'POST', headers: authHeaders });
```

## Hosting
Same options as discussed for the fire-safety project:
- **Cloud** (recommended for company-wide, multi-device access): host the backend on Render/Railway/AWS/Azure, MongoDB Atlas for the database (free tier is enough to start), and the frontend as a static build on Vercel/Netlify or served by the same backend.
- **Local company server**: run this backend on an internal Windows/Linux machine that's always on, MongoDB installed locally, and employees access it via the company network/VPN. Cheaper, but no access from outside the office network unless you set that up separately.

## Footer
All emails and the app itself carry: "Developed by Neeraj Yadav"
