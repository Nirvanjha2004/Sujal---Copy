# Docker Setup for Real Estate Portal Backend

This guide explains how to run the Real Estate Portal backend using Docker and Docker Compose.

## 📋 Prerequisites

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Download from: https://www.docker.com/products/docker-desktop
   - Ensure Docker Compose is included (comes with Docker Desktop)

2. **Git** (to clone the repository)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd real-estate-portal

# Copy environment template
cp .env.docker .env

# Edit environment variables (optional)
nano .env  # or use your preferred editor
```

### 2. Start Development Environment

**Windows:**
```cmd
docker.bat dev
```

**Linux/Mac:**
```bash
chmod +x docker.sh
./docker.sh dev
```

**Or using Docker Compose directly:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 3. Access Services

- **API:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api/docs
- **Database:** localhost:5432
- **Redis:** localhost:6379

## 🛠️ Management Commands

### Using Helper Scripts

The project includes helper scripts for common Docker operations:

**Windows (`docker.bat`):**
```cmd
docker.bat dev          # Start development environment
docker.bat prod         # Start production environment
docker.bat stop         # Stop all services
docker.bat logs         # View logs
docker.bat status       # Show service status
docker.bat help         # Show all commands
```

**Linux/Mac (`docker.sh`):**
```bash
./docker.sh dev         # Start development environment
./docker.sh prod        # Start production environment
./docker.sh stop        # Stop all services
./docker.sh logs        # View logs
./docker.sh status      # Show service status
./docker.sh help        # Show all commands
```

### Direct Docker Compose Commands

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose build --no-cache
```

## 🗄️ Database Operations

### Run Migrations

```bash
# Using helper script
./docker.sh migrate     # Linux/Mac
docker.bat migrate      # Windows

# Or directly
docker-compose run --rm migrations
```

### Seed Database

```bash
# Using helper script
./docker.sh seed        # Linux/Mac
docker.bat seed         # Windows

# Or directly
docker-compose exec backend npm run seed
```

### Access Database Shell

```bash
# Using helper script
./docker.sh db-shell    # Linux/Mac
docker.bat db-shell     # Windows

# Or directly
docker-compose exec postgres psql -U postgres -d real_estate_portal
```

## 🔧 Development Tools

### Start Development Tools (PgAdmin + Redis Commander)

```bash
# Using helper script
./docker.sh tools       # Linux/Mac
docker.bat tools        # Windows

# Or directly
docker-compose --profile tools up -d pgadmin redis-commander
```

### Access Development Tools

- **PgAdmin:** http://localhost:5050
  - Email: `admin@admin.com`
  - Password: `admin`
  
- **Redis Commander:** http://localhost:8081

### Backend Shell Access

```bash
# Using helper script
./docker.sh shell       # Linux/Mac
docker.bat shell        # Windows

# Or directly
docker-compose exec backend sh
```

## 🌍 Environment Configuration

The `.env` file contains all configuration variables:

```env
# Node Environment
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=real_estate_portal
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# API
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

## 🔄 Development vs Production

### Development Mode
- Hot reload enabled
- Source code mounted as volume
- Debug port exposed (9229)
- Development database
- All ports exposed for direct access

### Production Mode
- Optimized build
- No source code mounting
- Health checks enabled
- Production database
- Secure configuration

## 📊 Monitoring and Debugging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Check Service Status

```bash
# Using helper script
./docker.sh status

# Or directly
docker-compose ps
```

### Health Checks

All services include health checks:
- **Backend API:** HTTP health endpoint
- **PostgreSQL:** Connection test
- **Redis:** Ping test

## 🧹 Cleanup

### Stop Services

```bash
./docker.sh stop        # Using helper script
docker-compose down     # Direct command
```

### Complete Cleanup

```bash
# Remove containers, volumes, and images
./docker.sh clean

# Or manually
docker-compose down -v --rmi all
docker system prune -f
```

## 📁 Volume Management

The setup uses named volumes for data persistence:

- `postgres_data`: Database files
- `redis_data`: Redis persistence
- `uploads_data`: User uploaded files
- `pgadmin_data`: PgAdmin configuration

## 🔒 Security Notes

### For Production:

1. **Change default passwords:**
   ```env
   DB_PASSWORD=strong-secure-password
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   REDIS_PASSWORD=redis-secure-password
   ```

2. **Use secrets management:**
   - Docker Swarm secrets
   - Kubernetes secrets
   - External secret managers

3. **Network security:**
   - Don't expose database ports in production
   - Use reverse proxy (nginx/traefik)
   - Enable SSL/TLS

4. **Update base images regularly:**
   ```bash
   docker-compose pull
   docker-compose build --no-cache
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Change ports in .env file
   PORT=3001
   DB_PORT=5433
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues:**
   ```bash
   # Reset database
   docker-compose down -v
   docker-compose up -d postgres
   ```

4. **Memory issues:**
   ```bash
   # Increase Docker memory limit
   # Docker Desktop > Settings > Resources > Memory
   ```

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=*
```

## 📝 Scripts Reference

All available helper script commands:

| Command | Description |
|---------|-------------|
| `dev` | Start development environment |
| `prod` | Start production environment |
| `build` | Build application |
| `stop` | Stop all services |
| `restart` | Restart all services |
| `logs` | Show all logs |
| `logs-api` | Show backend logs only |
| `logs-db` | Show database logs only |
| `clean` | Remove containers and volumes |
| `migrate` | Run database migrations |
| `seed` | Run database seed |
| `shell` | Open backend container shell |
| `db-shell` | Open PostgreSQL shell |
| `redis-cli` | Open Redis CLI |
| `status` | Show service status |
| `tools` | Start development tools |
| `help` | Show help message |

## 🤝 Contributing

When working with Docker:

1. Test both development and production builds
2. Update this README for any Docker changes
3. Ensure migrations work in containerized environment
4. Test with clean volumes (no cached data)

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running: `docker info`
3. Check available resources: `docker system df`
4. Try clean rebuild: `./docker.sh clean && ./docker.sh dev`