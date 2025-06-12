# CodeNest

A secure, user-friendly monolithic app for managing reusable code snippets with authentication, role-based access, version control, tag-based search, activity feed, REST API, and JSON file storage.

## Quick Start

To develop and run CodeNest locally:

- In one terminal:
    ```
    cd backend
    pip install -r requirements.txt
    python app.py
    ```
- In another terminal:
    ```
    cd frontend
    npm install
    npm run dev
    ```

**IMPORTANT: Development Assets and Proxy Routing**

- When running in development mode (`npm run dev`), _all_ frontend static assets and hot-reload modules (e.g., `main.jsx`, `@react-refresh` runtime, etc.) must be requested from the Vite dev server on **port 5173**.  
- The Flask backend (port 8000) should only handle `/api/...` HTTP requests. It should never serve frontend dev assets when developing.
- Do **not** access the frontend through the backend's port (e.g., `http://localhost:8000/`). Instead, open your browser to [http://localhost:5173](http://localhost:5173) to ensure assets are served directly by Vite.
- The Vite dev server proxies `/api` requests to the backend (`http://localhost:8000`), but all other static/frontend asset requests (including `main.jsx`, `@react-refresh`) are resolved by Vite alone.
- If you see 404 errors for `main.jsx` or any `@react-refresh` resource when accessing on port 5173, make sure you are not misrouting those requests to the backend. Check your terminal logs and browser devtools for asset request origins.

Frontend is served from `/frontend/dist` by default (after `vite build`). In production deployments, the backend Flask server serves the built frontend.

Data is stored as JSON files in `backend/data/`.

## Features

- User registration/login, roles (admin, contributor, viewer)
- Full CRUD for code snippets (with version history)
- Tag, language filtering, full text search, activity feed, upvotes, comments
- RESTful API for UI, all data in JSON (no external DB)
- Download tracking, audit logs (admin view)
- Responsive UI
