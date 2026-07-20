# Serenity

A gentle task management app for humans, not robots.

Most productivity tools punish you for being human. Red overdue labels. Broken streaks. Endless lists that scream "you're falling behind."

Serenity is different. It was built from a real struggle with procrastination, overwhelm, and the emotional weight of trying to remember everything. It doesn't just store tasks; it helps you start.

---

## Philosophy

- No shame. Tasks that slip past their due date drift into Limbo, not a red "overdue" pile.
- No streaks. Progress is celebrated quietly; a plant that grows with your wins, not a counter that resets.
- Gentle check-ins. Daily prompts that ask how you're doing, not just what you're doing.
- Your space. A Vault for memories, quotes, and things that anchor you. Private. No sharing.

---

## Features

### Task Management
- Create tasks with categories (Business, Personal, Family), priorities, and due dates
- Subtasks with individual toggles; completing all auto-completes the task
- Active / Limbo / Archive / Routine tabs
- Search across titles, descriptions, and subtasks
- Routine tasks (daily, weekly, monthly, yearly, custom) with day selection and end conditions
- Routine templates separate from generated instances; edit without duplication

### Brain Dump (Capture)
- Offload thoughts without organizing them
- "Let it out" release animation; thoughts float away
- Convert dumps to tasks with one click
- Rotating empty state messages

### Daily Pulse
- One gentle question per day
- Answer or skip; no judgment
- History viewable in Insights

### Insights
- Micro-wins with a growing plant
- Milestone celebrations at 5, 10, 25, 50, 100 wins
- Rotating prompts and messages
- Check-in history timeline

### Vault
- Store notes, quotes, memories, links, and images
- YouTube/Spotify link detection with styled previews
- Clickable cards open full detail modal
- Floating diamond animation, rotating messages
- First-treasure celebration

### Presence Mode
- A breathing timer that says "You don't have to do anything right now."

### Design
- Light and dark mode with full design system
- CSS custom properties for consistent theming
- Responsive mobile-first layout
- PWA; installable on any device

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, React Query, React Router |
| Backend | FastAPI (Python), Pydantic, SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT with access/refresh tokens |
| PWA | Service Worker, Web App Manifest |

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm

### Fontend 

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```