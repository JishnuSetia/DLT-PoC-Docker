# POC Gallery

A modern, responsive Proof of Concept (PoC) Gallery designed to provide a centralized interface for discovering, filtering, viewing, and interacting with technology-focused PoCs.

The application provides a clean government-oriented interface for showcasing PoCs developed across different agencies, teams, and technology areas.

---

## Overview

POC Gallery is a web-based platform that allows users to:

- Browse available Proofs of Concept
- Search PoCs by title, description, or agency
- Filter PoCs by agency
- Filter PoCs by technology
- Filter PoCs by status
- View detailed information about individual PoCs
- View PoC benefits and technology stacks
- View team members associated with each PoC
- Share individual PoCs through a unique URL
- Open a PoC directly using a shared URL
- Navigate to external PoC resources
- Start an AI-powered chat experience for a specific PoC
- Run the application with a lightweight Python/FastAPI backend

The frontend is designed to remain lightweight and dependency-free, while the backend provides the foundation for AI-powered functionality.

---

# Features

## PoC Gallery

PoCs are displayed as responsive cards containing:

- Agency
- PoC title
- Description
- Current status
- Technology stack
- Team size
- View Details action

Cards automatically adapt to the available screen size.

### Status Indicators

Each PoC has a status indicator:

- **Planning**
- **In Progress**
- **Complete**
- **Blocked**

The status is represented visually through both a badge and a colored status bar.

---

## Search

Users can search across:

- PoC title
- PoC description
- Agency

Search results update dynamically as the user types.

---

## Filtering

The gallery supports multiple filtering options.

### Agency

Filter PoCs by the organization or agency responsible for the PoC.

### Technology

A multi-select technology filter allows users to select multiple technologies simultaneously.

For example:

```text
Python
React
FastAPI
AI
Machine Learning
GIS
````

A PoC matches the technology filter if it contains at least one of the selected technologies.

### Status

PoCs can also be filtered by their current status.

---

# PoC Details

Selecting **View Details** opens a modal containing additional information about the PoC.

The modal can contain:

* Status
* Agency
* Title
* Full description
* External PoC link
* Share button
* AI chat button
* Demo preview
* Benefits
* Technology stack
* Team members

The modal includes:

* Keyboard support
* Escape-to-close
* Focus restoration
* Basic focus trapping
* Background scroll locking
* Responsive mobile layout
* Scroll position reset when opened

---

# Sharing PoCs

Every PoC can generate a unique shareable URL.

Example:

```text
index.html?poc=1
```

When a user opens a URL containing a PoC ID, the application automatically:

1. Loads the PoC data
2. Finds the requested PoC
3. Opens the PoC details modal

This allows individual PoCs to be shared directly.

---

# AI PoC Chat

The project includes a separate chat interface for interacting with an AI assistant associated with a specific PoC.

When a user clicks:

```text
Chat with PoC
```

they are redirected to:

```text
chat.html?poc=<POC_ID>
```

The chat interface uses the backend AI service to maintain conversations and generate responses.

---

# Technology Stack

## Frontend

The frontend is intentionally lightweight and does not require a frontend framework.

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| HTML5      | Page structure                |
| CSS3       | Styling and responsive layout |
| JavaScript | Application logic             |
| JSON       | PoC data storage              |
| Dubai Font | UI typography                 |

---

## Backend

The backend provides API functionality for the AI chat system.

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Python     | Backend language           |
| FastAPI    | REST API framework         |
| Pydantic   | Data validation            |
| Ollama     | Local AI model integration |
| Uvicorn    | ASGI development server    |

---

# Project Structure

```text
DDL-POC-WEB/
├── README.md
├── assets
│   ├── favicon.png
│   ├── font
│   │   ├── Dubai-Bold.ttf
│   │   ├── Dubai-Light.ttf
│   │   ├── Dubai-Medium.ttf
│   │   └── Dubai-Regular.ttf
│   └── logo.png
├── backend
│   ├── app
│   │   ├── __init__.py
│   │   ├── __pycache__
│   │   │   ├── __init__.cpython-311.pyc
│   │   │   └── main.cpython-311.pyc
│   │   ├── ai
│   │   │   ├── __init__.py
│   │   │   ├── __pycache__
│   │   │   │   ├── __init__.cpython-311.pyc
│   │   │   │   ├── ollama.cpython-311.pyc
│   │   │   │   ├── prompts.cpython-311.pyc
│   │   │   │   ├── router.cpython-311.pyc
│   │   │   │   ├── schemas.cpython-311.pyc
│   │   │   │   └── service.cpython-311.pyc
│   │   │   ├── ollama.py
│   │   │   ├── prompts.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   ├── main.py
│   │   └── sessions
│   │       ├── __init__.py
│   │       ├── __pycache__
│   │       │   ├── __init__.cpython-311.pyc
│   │       │   ├── manager.cpython-311.pyc
│   │       │   └── schemas.cpython-311.pyc
│   │       ├── manager.py
│   │       └── schemas.py
│   └── requirements.txt
├── chat.html
├── css
│   ├── chat.css
│   └── style.css
├── data
│   └── pocs.json
├── index.html
└── js
    ├── app.js
    └── chat.js
```

---

# Data Structure

PoC information is currently stored in:

```text
data/pocs.json
```

The frontend loads the data dynamically using:

```javascript
fetch("data/pocs.json")
```

A PoC follows the general structure:

```json
{
    "id": 1,
    "title": "Example PoC",
    "agency": "Digital Lab",
    "status": "In Progress",
    "description": "Short description of the PoC.",
    "fullDescription": "Detailed description of the PoC.",
    "technologies": [
        "Python",
        "FastAPI",
        "AI"
    ],
    "benefits": [
        "Improves efficiency",
        "Reduces manual work"
    ],
    "team": [
        {
            "name": "John Doe",
            "role": "Developer"
        }
    ],
    "link": "https://example.com"
}
```

---

# Future API Integration

The current gallery loads PoC data from:

```text
data/pocs.json
```

The frontend is structured so that this can be replaced with an API endpoint later.

Currently:

```javascript
const response = await fetch("data/pocs.json");
```

This can eventually become something similar to:

```javascript
const response = await fetch(
    "https://api.example.com/api/pocs"
);
```

The API should ideally return an array of PoC objects matching the expected data structure.

---

# Running the Project

## Frontend Only

Because the frontend loads JSON using `fetch()`, it should be served through a local HTTP server rather than opened directly using:

```text
file://
```

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

# Running the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it.

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation can be accessed at:

```text
http://127.0.0.1:8000/docs
```

---

# AI Backend

The AI functionality is separated into its own module:

```text
backend/app/ai/
```

The module contains:

### `ollama.py`

Handles communication with the local Ollama service.

### `prompts.py`

Contains prompts used by the AI system.

### `schemas.py`

Defines request and response structures.

### `service.py`

Contains the core AI service logic.

### `router.py`

Exposes AI functionality through FastAPI routes.

---

# Session Management

Chat sessions are managed under:

```text
backend/app/sessions/
```

The session module provides:

* Session creation
* Session identification
* Conversation state management
* Session schemas

The main implementation is contained in:

```text
backend/app/sessions/manager.py
```

---

# UI Design

The interface follows a modern government digital portal aesthetic.

## Design Principles

* Clean
* Professional
* Accessible
* Responsive
* Minimal
* Information-focused

The interface uses a light color palette with:

* White surfaces
* Light gray backgrounds
* Royal blue primary actions
* Clear status indicators
* Subtle borders
* Minimal shadows

---

# Typography

The application uses the locally hosted Dubai font family.

The font files are located at:

```text
assets/font/
```

The available weights are:

```text
Dubai Light      → 300
Dubai Regular    → 400
Dubai Medium     → 500
Dubai Bold       → 700
```

The fonts are loaded through CSS using `@font-face`.

This avoids relying on an external font provider and allows the application to use the same typography when deployed in environments with restricted internet access.

---

# Responsive Design

The gallery supports:

### Desktop

Three PoC cards per row.

```text
┌──────────┐ ┌──────────┐ ┌──────────┐
│   PoC    │ │   PoC    │ │   PoC    │
└──────────┘ └──────────┘ └──────────┘
```

### Tablet

Two cards per row.

```text
┌──────────┐ ┌──────────┐
│   PoC    │ │   PoC    │
└──────────┘ └──────────┘
```

### Mobile

One card per row.

```text
┌──────────┐
│   PoC    │
└──────────┘
```

The modal also adapts to mobile screens and becomes a bottom-sheet style interface.

---

# Accessibility

The application includes several accessibility considerations.

## Keyboard Navigation

The details modal supports:

```text
Escape
Tab
Shift + Tab
```

`Escape` closes the modal.

Tab navigation is constrained within the modal while it is open.

---

## Focus Management

When a modal is opened, the previously focused element is stored.

When the modal closes, focus is returned to that element.

---

## Reduced Motion

The application respects:

```css
prefers-reduced-motion
```

Users who have reduced-motion preferences enabled receive minimal animations and transitions.

---

# Security Considerations

User-provided or externally loaded data is escaped before being inserted into HTML.

The application uses:

```javascript
escapeHTML()
```

and:

```javascript
escapeAttribute()
```

to reduce the risk of HTML injection when rendering PoC data.

External links opened in a new tab use:

```html
target="_blank"
rel="noopener noreferrer"
```

---

# Browser Support

The application relies on modern browser APIs including:

* Fetch API
* URLSearchParams
* Clipboard API
* Web Share API
* ES6 JavaScript

Recommended browsers:

* Google Chrome
* Microsoft Edge
* Safari
* Firefox

---

# Development Notes

## Adding a New PoC

Add a new object to:

```text
data/pocs.json
```

Example:

```json
{
    "id": 10,
    "title": "New AI PoC",
    "agency": "Digital Lab",
    "status": "Planning",
    "description": "A new artificial intelligence proof of concept.",
    "fullDescription": "Detailed information about the PoC.",
    "technologies": [
        "Python",
        "AI",
        "FastAPI"
    ],
    "benefits": [
        "Improved efficiency",
        "Automation"
    ],
    "team": [
        {
            "name": "Jane Doe",
            "role": "AI Engineer"
        }
    ],
    "link": "https://example.com"
}
```

The gallery will automatically:

1. Display the PoC
2. Include its agency in the agency filter
3. Include its technologies in the technology filter
4. Include its status in status filtering
5. Display its team
6. Generate its share URL

---

# Customizing Statuses

Statuses are normalized through:

```javascript
statusClassFor()
```

Supported statuses include:

```text
Planning
In Progress
Complete
Completed
Blocked
```

Additional statuses can be mapped by modifying:

```javascript
statusClassFor()
```

and adding the corresponding CSS rules.

---

# Main Frontend Files

## `index.html`

Contains the main POC Gallery page structure.

---

## `js/app.js`

Contains the primary gallery functionality:

* Loading PoC data
* Rendering cards
* Search
* Filtering
* Technology multi-select
* Modal management
* Sharing
* URL-based PoC navigation
* Team rendering

---

## `chat.html`

Contains the PoC AI chat interface.

---

## `js/chat.js`

Contains the chat frontend logic.

---

## `css/style.css`

Contains the primary gallery styling.

---

## `css/chat.css`

Contains the chat interface styling.

---

# Architecture

The current architecture can be summarized as:

```text
                    ┌──────────────────┐
                    │     User         │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   POC Gallery    │
                    │    index.html    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    app.js        │
                    │                  │
                    │ Search           │
                    │ Filtering        │
                    │ Rendering        │
                    │ Modal            │
                    │ Sharing          │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   pocs.json      │
                    │   PoC Dataset    │
                    └──────────────────┘


                    AI CHAT FLOW

                    ┌──────────────────┐
                    │    chat.html     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    chat.js       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    FastAPI       │
                    │     Backend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   AI Service     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Ollama       │
                    └──────────────────┘
```

---

# Deployment

The frontend can be deployed as a static website on any platform capable of serving HTML, CSS, JavaScript, and JSON.

Examples include:

* Nginx
* Apache
* GitHub Pages
* Cloudflare Pages
* Vercel
* Netlify
* Internal government infrastructure

The backend should be deployed separately as a Python/FastAPI service.

For production deployment, the frontend API endpoint should be configured to point to the production backend rather than a local development server.

---

# Production Considerations

Before production deployment, consider implementing:

* API-based PoC data instead of static JSON
* Authentication and authorization
* HTTPS
* Production CORS configuration
* API request validation
* Rate limiting
* Persistent chat sessions
* Production AI infrastructure
* Centralized logging
* Error monitoring
* Database-backed PoC storage
* Image storage for team members
* Video/demo storage
* Automated testing
* CI/CD
* Environment-based configuration

---

# Roadmap

Potential future improvements include:

* [ ] Connect PoC Gallery to production API
* [ ] Add team member profile photos
* [ ] Add PoC screenshots
* [ ] Add actual video demonstrations
* [ ] Add pagination
* [ ] Add advanced search
* [ ] Add sorting
* [ ] Add PoC categories
* [ ] Add favorites/bookmarks
* [ ] Add analytics
* [ ] Add authentication
* [ ] Add administrative PoC management
* [ ] Add database-backed storage
* [ ] Add AI-powered PoC recommendations
* [ ] Add AI risk assessment
* [ ] Add AI-generated PoC summaries
* [ ] Add automated API synchronization

---

# License

This project is intended for internal use.

Unless otherwise specified, all project code, data, assets, and documentation are proprietary and should not be redistributed or used outside the intended organization without authorization.

---

## Project Information

| Field | Details |
|---|---|
| **Project** | Digital Lab POC Gallery |
| **Author** | Jishnu Setia |
| **Role** | AI & Machine Learning Intern |
| **Organization** | Digital Lab Technology |
| **Purpose** | Centralized gallery for showcasing Proofs of Concept |
| **Status** | Active Development |

> This project is intended for internal use by Digital Lab Technology.