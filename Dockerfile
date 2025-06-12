# Multistage build: combine backend and frontend into a single container

# Build frontend
FROM node:20 as client-build
WORKDIR /client
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Prepare backend
FROM python:3.11-slim as backend-build
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=client-build /client/dist ./frontend/dist

EXPOSE 8000
CMD ["python", "app.py"]
