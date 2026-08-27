# POC Gallery

A modern, responsive Proof of Concept (PoC) Gallery designed to provide a centralized interface for discovering, filtering, viewing, and interacting with technology-focused PoCs.

The application provides a clean, government-oriented interface for showcasing PoCs developed across different agencies, teams, and technology areas.

> **Current Version:** AI/chat functionality is not included in this release. The backend currently provides PoC and deliverable API functionality, while the AI functionality is reserved for a future version.

---

# Overview

POC Gallery is a web-based platform that allows users to:

* Browse available Proofs of Concept
* Search PoCs by title, description, or agency
* Filter PoCs by agency
* Filter PoCs by technology
* Filter PoCs by status
* View detailed information about individual PoCs
* View PoC benefits and technology stacks
* View team members associated with each PoC
* View PoC demonstration videos
* Share individual PoCs through unique URLs
* Open a PoC directly using a shared URL
* Navigate to external PoC resources
* Retrieve PoC and deliverable information through the backend API
* Run the application using Docker containers

The frontend is lightweight and dependency-free, while the backend provides API functionality for PoC and deliverable data.

---

# Features

## PoC Gallery

PoCs are displayed as responsive cards containing:

* Agency
* PoC title
* Description
* Current status
* Technology stack
* Team size
* View Details action

Cards automatically adapt to the available screen size.

### Status Indicators

Each PoC has a status indicator.

Supported frontend statuses include:

* **Planning**
* **In Progress**
* **Complete**
* **Completed**
* **Blocked**

The status is represented visually through both a badge and a status bar.

---

# Search

Users can search across:

* PoC title
* PoC description
* Agency

Search results update dynamically as the user types.

---

# Filtering

The gallery supports multiple filtering options.

## Agency

Filter PoCs by the organization or agency responsible for the PoC.

## Technology

A multi-select technology filter allows users to select multiple technologies simultaneously.

For example:

```text
Python
React
FastAPI
AI
Machine Learning
GIS
```

A PoC matches the technology filter if it contains at least one of the selected technologies.

## Status

PoCs can also be filtered by their current status.

---

# PoC Details

Selecting **View Details** opens the PoC details interface.

The details page can contain:

* Status
* Agency / Department
* Title
* Description
* External PoC link
* Share button
* Demo video
* Benefits
* Technology stack
* Team members

The interface is responsive and adapts to desktop, tablet, and mobile layouts.

---

# Demonstration Videos

PoC demonstration videos can be provided through the backend API.

For the current development version, PoC 1 / Deliverable 7 uses a locally hosted demonstration video:

```text
assets/video/poc1.mp4
```

Other deliverables can use the backend video proxy endpoint:

```text
/api/deliverables/{id}/demo-video
```

If a demonstration video cannot be loaded, the frontend automatically displays a video placeholder.

---

# Sharing PoCs

Individual PoCs can be opened through a URL containing their identifier.

For example:

```text
poc.html?id=7
```

When a user opens a URL containing a PoC ID, the application:

1. Reads the PoC ID from the URL
2. Requests the corresponding deliverable from the backend
3. Loads the PoC information
4. Displays the requested PoC

The **Share** action copies the current PoC URL to the user's clipboard.

---

# Backend API

The application includes a lightweight Python/FastAPI backend.

The backend currently provides deliverable-related API endpoints used by the frontend.

The backend is responsible for:

* Retrieving deliverable information
* Retrieving deliverable details
* Proxying demonstration videos where applicable
* Communicating with external LabPortal services
* Returning structured API responses to the frontend

The backend is located under:

```text
backend/
```

---

# Current Architecture

The current application consists of two Dockerized services:

```text
                    ┌─────────────────────┐
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Nginx         │
                    │   Frontend Server   │
                    │      Port 80        │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             Static Frontend        /api/* Requests
             HTML/CSS/JS/JSON              │
                                          ▼
                               ┌─────────────────────┐
                               │      FastAPI        │
                               │       Backend       │
                               │      Port 8000      │
                               └──────────┬──────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │      LabPortal      │
                               │        APIs         │
                               └─────────────────────┘
```

---

# Docker Architecture

The project is containerized using Docker Compose.

There are currently two containers:

## Frontend Container

The frontend container runs Nginx.

Responsibilities:

* Serve HTML files
* Serve CSS
* Serve JavaScript
* Serve images and videos
* Serve JSON assets
* Proxy `/api/` requests to the backend

The frontend is exposed on:

```text
http://localhost
```

## Backend Container

The backend container runs FastAPI using Uvicorn.

Responsibilities:

* Provide REST API endpoints
* Handle deliverable requests
* Communicate with LabPortal
* Proxy demonstration videos where applicable

The backend listens internally on:

```text
0.0.0.0:8000
```

The backend is intentionally not exposed directly to the host in the current Docker configuration. Nginx communicates with it through the Docker Compose network.

---

# Nginx API Proxy

The frontend uses relative API URLs.

For example:

```javascript
const API_BASE_URL = "";
```

A request such as:

```text
/api/deliverables/7
```

is handled by Nginx and proxied to:

```text
http://backend:8000/api/deliverables/7
```

This avoids hardcoding a backend hostname or port into the frontend.

It also allows the frontend and backend to be deployed together behind a single public endpoint.

---

# Technology Stack

## Frontend

| Technology | Purpose                                             |
| ---------- | --------------------------------------------------- |
| HTML5      | Page structure                                      |
| CSS3       | Styling and responsive layout                       |
| JavaScript | Application logic                                   |
| JSON       | Local/static data                                   |
| Dubai Font | UI typography                                       |
| Nginx      | Production static file server and API reverse proxy |

The frontend does not use a frontend framework or package manager.

---

## Backend

| Technology    | Purpose                   |
| ------------- | ------------------------- |
| Python        | Backend language          |
| FastAPI       | REST API framework        |
| Pydantic      | Data validation           |
| HTTPX         | HTTP communication        |
| python-dotenv | Environment configuration |
| Uvicorn       | ASGI server               |

---

## Infrastructure

| Technology     | Purpose                           |
| -------------- | --------------------------------- |
| Docker         | Containerization                  |
| Docker Compose | Multi-container orchestration     |
| Nginx          | Frontend server and reverse proxy |

---

# Project Structure

```text
DDL-POC-WEB/

├── README.md
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
│
├── assets/
│   ├── favicon.png
│   ├── font/
│   │   ├── Dubai-Bold.ttf
│   │   ├── Dubai-Light.ttf
│   │   ├── Dubai-Medium.ttf
│   │   └── Dubai-Regular.ttf
│   ├── images/
│   ├── video/
│   │   └── poc1.mp4
│   └── logo.png
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       └── deliverables/
│           ├── __init__.py
│           └── router.py
│
├── css/
│   ├── poc.css
│   └── style.css
│
├── data/
│   └── pocs.json
│
├── js/
│   ├── app.js
│   └── poc.js
│
├── index.html
└── poc.html
```

---

# Data Structure

The current gallery dataset is stored in:

```text
data/pocs.json
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
        "FastAPI"
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

The exact fields returned by the backend may differ from the local development dataset as the application transitions toward API-based data.

---

# Running the Project

## Docker — Recommended

Docker is the recommended way to run the current version.

From the project root:

```bash
docker compose build
```

Then start the application:

```bash
docker compose up
```

The frontend will be available at:

```text
http://localhost
```

The backend is available to the frontend through the internal Docker network.

To run the containers in the background:

```bash
docker compose up -d
```

To stop the application:

```bash
docker compose down
```

To rebuild after making code changes:

```bash
docker compose down
docker compose build
docker compose up
```

---

# Backend Environment Variables

The backend can use environment variables for configuration.

For example:

```text
LABPORTAL_API_KEY
```

The project can provide these values through a `.env` file.

Example:

```text
LABPORTAL_API_KEY=your_api_key_here
```

> **Important:** `.env` files containing credentials must not be committed to Git.

A production deployment should use the deployment platform's secret/environment-variable management instead of storing credentials in the repository.

---

# Running Without Docker

Docker is recommended for deployment, but the backend can also be run directly during development.

## Frontend Only

Because the frontend may load JSON using `fetch()`, it should be served through a local HTTP server rather than opened directly using:

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

## Backend

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

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# API Endpoints

The current backend exposes deliverable-related routes under:

```text
/api/deliverables/
```

Examples include:

```text
GET /api/deliverables/{id}
```

and:

```text
GET /api/deliverables/{id}/demo-video
```

The exact API behavior is implemented in:

```text
backend/app/deliverables/router.py
```

FastAPI automatically provides interactive API documentation at:

```text
/docs
```

when the backend is running.

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

The interface uses:

* White surfaces
* Light gray backgrounds
* Royal blue primary actions
* Clear status indicators
* Subtle borders
* Minimal shadows

---

# Typography

The application uses the locally hosted Dubai font family.

Font files are located at:

```text
assets/font/
```

Available weights:

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

The gallery supports multiple screen sizes.

## Desktop

Three PoC cards per row.

```text
┌──────────┐ ┌──────────┐ ┌──────────┐
│   PoC    │ │   PoC    │ │   PoC    │
└──────────┘ └──────────┘ └──────────┘
```

## Tablet

Two cards per row.

```text
┌──────────┐ ┌──────────┐
│   PoC    │ │   PoC    │
└──────────┘ └──────────┘
```

## Mobile

One card per row.

```text
┌──────────┐
│   PoC    │
└──────────┘
```

The PoC details interface also adapts to smaller screens.

---

# Accessibility

The application includes several accessibility considerations.

## Keyboard Navigation

The details interface supports:

```text
Escape
Tab
Shift + Tab
```

`Escape` can be used to close the details interface where applicable.

## Focus Management

The application manages focus when opening and closing interactive UI elements.

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

to reduce the risk of HTML injection when rendering dynamic PoC data.

External links opened in a new tab use:

```html
target="_blank"
rel="noopener noreferrer"
```

Backend credentials are provided through environment variables rather than being embedded directly into frontend code.

---

# Browser Support

The application relies on modern browser APIs including:

* Fetch API
* URLSearchParams
* Clipboard API
* ES6 JavaScript
* HTML5 video

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

The gallery will automatically use the available PoC information when rendering the gallery.

Depending on the current API integration, production PoC information may instead come from the backend.

---

# Main Frontend Files

## `index.html`

Contains the main PoC Gallery page structure.

---

## `poc.html`

Contains the PoC detail page structure.

---

## `js/app.js`

Contains the primary gallery functionality:

* Loading PoC data
* Rendering cards
* Search
* Filtering
* Technology multi-select
* Modal/details management
* Sharing
* URL-based navigation
* Team rendering

---

## `js/poc.js`

Contains the PoC detail functionality:

* Loading individual deliverables
* Rendering PoC details
* Video handling
* Team rendering
* Benefits rendering
* Technology rendering
* Sharing
* Error handling

---

## `css/style.css`

Contains the primary gallery styling.

---

## `css/poc.css`

Contains PoC detail page styling.

---

# Docker Files

## `Dockerfile`

Builds the frontend container and packages the static website with Nginx.

## `backend/Dockerfile`

Builds the FastAPI backend container.

## `docker-compose.yml`

Defines and orchestrates the frontend and backend containers.

## `nginx.conf`

Configures Nginx to:

* Serve the frontend
* Serve static assets
* Proxy `/api/` requests to FastAPI

---

# Production Deployment

The current architecture is designed to support deployment as a containerized web application.

Recommended production architecture:

```text
                    Internet / Internal Network
                              │
                              ▼
                    ┌──────────────────┐
                    │      Nginx       │
                    │   HTTPS / Proxy  │
                    └────────┬─────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
          Static Frontend           FastAPI API
             Container              Container
                                         │
                                         ▼
                                    LabPortal API
```

The current Docker Compose setup is suitable for development, testing, demonstrations, and controlled internal deployment.

Production deployment should additionally consider:

* HTTPS/TLS
* Secure secret management
* Production CORS configuration
* Authentication and authorization
* API request validation
* Rate limiting
* Centralized logging
* Error monitoring
* Health checks
* Container resource limits
* Persistent data storage where required
* Automated testing
* CI/CD
* Production reverse-proxy configuration
* Backup and recovery procedures

---

# Current Limitations

The current version intentionally does **not** include the previously planned AI chat functionality.

The following are currently outside the scope of this release:

* AI-powered PoC chat
* Ollama integration
* AI session management
* AI-generated summaries
* AI-powered recommendations
* AI risk assessment

These features may be introduced in future releases as separate backend services/modules.

---

# Roadmap

Potential future improvements include:

* [ ] Connect PoC Gallery to production API
* [ ] Replace static PoC dataset with production data
* [ ] Add team member profile photos
* [ ] Add PoC screenshots
* [ ] Add additional video demonstrations
* [ ] Add pagination
* [ ] Add advanced search
* [ ] Add sorting
* [ ] Add PoC categories
* [ ] Add favorites/bookmarks
* [ ] Add analytics
* [ ] Add authentication
* [ ] Add administrative PoC management
* [ ] Add database-backed storage
* [ ] Add automated API synchronization
* [ ] Add automated testing
* [ ] Add CI/CD pipeline
* [ ] Reintroduce AI functionality as a separate service
* [ ] Add AI-powered PoC recommendations
* [ ] Add AI-generated PoC summaries
* [ ] Add AI risk assessment

---

# License

This project is intended for internal use.

Unless otherwise specified, all project code, data, assets, and documentation are proprietary and should not be redistributed or used outside the intended organization without authorization.

---

# Project Information

| Field            | Details                                              |
| ---------------- | ---------------------------------------------------- |
| **Project**      | Digital Lab POC Gallery                              |
| **Author**       | Jishnu Setia                                         |
| **Role**         | AI & Machine Learning Intern                         |
| **Organization** | Digital Lab Technology                               |
| **Purpose**      | Centralized gallery for showcasing Proofs of Concept |
| **Architecture** | Dockerized Nginx + FastAPI                           |
| **Status**       | Active Development                                   |

> This project is intended for internal use by Digital Lab Technology.
