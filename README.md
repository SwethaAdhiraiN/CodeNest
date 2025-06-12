# CodeNest

A secure, user-friendly monolithic app for managing reusable code snippets with authentication, role-based access, version control, tag-based search, activity feed, REST API, and JSON file storage.

## Quick Start

1. Build and run with Docker:

    ```bash
    docker build -t codenest .
    docker run -p 8000:8000 codenest
    ```

2. Or develop locally:

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

Frontend is served from `/frontend/dist`.

Data is stored as JSON files in `backend/data/`.

## Features

- User registration/login, roles (admin, contributor, viewer)
- Full CRUD for code snippets (with version history)
- Tag, language filtering, full text search, activity feed, upvotes, comments
- RESTful API for UI, all data in JSON (no external DB)
- Download tracking, audit logs (admin view)
- Responsive UI, deployable as a Docker monolith
