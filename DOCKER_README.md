# Docker Setup for Splitwise Clone

This document explains how to run both the frontend and backend servers using Docker.

## Prerequisites

- Docker Desktop installed on your system
- Docker Compose (included with Docker Desktop)

## Quick Start

To run both the frontend and backend servers with a single command:

```bash
docker-compose up --build
```

This command will:
- Build both the frontend and backend Docker images
- Start both services
- Set up networking between them
- Make the application accessible on your local machine

## Services

### Backend (FastAPI)
- **Port**: 8000
- **Access**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Frontend (React + Vite)
- **Port**: 5173
- **Access**: http://localhost:5173

## Available Commands

### Start services (build if needed)
```bash
docker-compose up --build
```

### Start services in detached mode (background)
```bash
docker-compose up -d --build
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

### Rebuild services
```bash
docker-compose build --no-cache
```

### Clean up (remove containers, networks, volumes)
```bash
docker-compose down -v --rmi all
```

## Development

The Docker setup includes volume mounts for development:
- Changes to your code will automatically reload the services
- Backend uses `--reload` flag for hot reloading
- Frontend uses Vite's built-in hot reloading

## Troubleshooting

### Port conflicts
If you get port conflicts, you can modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change 8000 to 8001 for backend
  - "3000:5173"  # Change 5173 to 3000 for frontend
```

### Database issues
The backend uses SQLite by default. If you encounter database issues:
```bash
docker-compose down -v  # This removes volumes including database
docker-compose up --build
```

### Permission issues (Linux/Mac)
If you encounter permission issues:
```bash
sudo docker-compose up --build
```

## Network Configuration

The services communicate through a custom Docker network called `splitwise-network`. This allows:
- Backend to be accessible from frontend using service name `backend`
- Proper isolation from other Docker projects
- Automatic DNS resolution between services

## Environment Variables

You can customize the setup by modifying environment variables in `docker-compose.yml`:
- `DATABASE_URL`: Database connection string for backend
- `VITE_API_URL`: API URL for frontend (set to backend service)

## Production Deployment

For production deployment, consider:
1. Using multi-stage builds for smaller images
2. Using production-ready database (PostgreSQL, MySQL)
3. Setting up proper environment variables
4. Using Docker secrets for sensitive data
5. Implementing health checks 