# Aman Real Estate Platform - Docker Setup Guide

## Project Architecture

```
                         INTERNET
                            │
                            ▼
                      ┌─────────────┐
                      │ Main Nginx  │
                      │   :80       │
                      └──────┬──────┘
                             │
                      Docker network
                             │
                ┌────────────┴────────────┐
                │                         │
          /api/ │                         │ /
                ▼                         ▼
         ┌────────────┐           ┌────────────┐
         │  Backend   │           │  Frontend  │
         │  Django    │           │ Nginx+Vite │
         │  :8000     │           │   :80      │
         └────────────┘           └────────────┘
                │
                ▼
         ┌────────────┐
         │ PostgreSQL │
         │  :5432     │
         └────────────┘
```

## Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
cd your-project-directory
```

### 2. Create Environment File

The `.env` file is already created with default values. Update it if needed:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
DEBUG=True
SECRET_KEY=your-secure-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,nginx
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
DB_NAME=aman_db
DB_USER=postgres
DB_PASSWORD=postgres
VITE_API_BASE_URL=http://localhost/api
```

### 3. Build and Start Containers

```bash
docker compose build
docker compose up -d
```

### 4. Run Migrations

```bash
docker compose run --rm backend python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
docker compose run --rm backend python manage.py createsuperuser
```

### 6. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Admin Panel**: http://localhost/admin
- **Health Check**: http://localhost/health

## Docker Images

- **backend**: Django REST API (Python 3.11)
- **frontend**: React/Vite application (Node 18 Alpine)
- **nginx**: Nginx reverse proxy (Alpine)
- **db**: PostgreSQL 15 (Alpine)

## Common Commands

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f [service_name]
```

### Run Backend Tests
```bash
docker compose run --rm backend python manage.py test
```

### Access Backend Container
```bash
docker compose exec backend bash
```

### Access Frontend Container
```bash
docker compose exec frontend sh
```

### Database Shell
```bash
docker compose exec db psql -U postgres -d aman_db
```

### Rebuild Containers
```bash
docker compose build --no-cache
docker compose up -d
```

## Troubleshooting

### Port Already in Use
If port 80 is in use, modify the `docker-compose.yml`:

```yaml
nginx:
  ports:
    - "8080:80"  # Access at http://localhost:8080
```

### Database Connection Issues
Ensure the database is running:
```bash
docker compose logs db
```

### Frontend Not Loading
Clear the browser cache and restart containers:
```bash
docker compose down -v
docker compose up -d
```

### Backend API Not Responding
Check backend logs:
```bash
docker compose logs backend
```

## GitHub Actions CI/CD

The workflow in `.github/workflows/ci.yml` will:
- Build Docker containers
- Run backend tests
- Build frontend
- Run linting checks
- (Optional) Push images to registry on main branch

### Setting Up Docker Registry (Optional)

1. Add Docker Hub secrets to GitHub:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`

2. Update `.github/workflows/ci.yml` with your registry details

## Production Deployment

For production:

1. Update `.env` with production values:
   ```env
   DEBUG=False
   SECRET_KEY=your-production-secret-key
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

2. Use a production database (not SQLite)

3. Set up SSL/TLS with Let's Encrypt

4. Use a reverse proxy (nginx)

5. Set up log management and monitoring

## File Structure

```
├── .env                          # Environment variables (local)
├── .env.example                  # Environment template
├── docker-compose.yml            # Docker Compose configuration
├── nginx.conf                    # Nginx configuration
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions workflow
├── backend/
│   ├── Dockerfile                # Backend Docker image
│   ├── requirements.txt           # Python dependencies
│   └── ...                        # Django project files
└── frontend/
    ├── Dockerfile                # Frontend Docker image
    ├── package.json              # Node dependencies
    └── ...                        # React/Vite project files
```

## API Endpoints

All API endpoints are accessed through nginx at:
- `http://localhost/api/` (from client)
- `http://backend:8000/` (from docker network)

The frontend automatically uses `/api/` which is proxied to the backend via nginx.

## Notes

- The frontend Vite dev server is not used in Docker; production build is used
- All containers are on the same Docker network for communication
- Media files are persisted in volumes
- Database data is persisted in postgres volume
- Migrations run automatically on backend startup

---

For more information, refer to:
- [Docker Documentation](https://docs.docker.com/)
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Nginx Documentation](https://nginx.org/en/docs/)
