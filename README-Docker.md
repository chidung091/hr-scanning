# HR Scanning Application - Docker Setup

This document provides comprehensive instructions for running the HR Scanning application using Docker with PostgreSQL database.

## 🚀 Quick Start

### Development Environment

1. **Start PostgreSQL database only:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres
   ```

2. **Configure environment for PostgreSQL:**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env and set:
   DB_CONNECTION=postgres
   DB_HOST=localhost
   DB_PORT=5433
   DB_USERNAME=hr_user
   DB_PASSWORD=hr_password_dev
   DB_DATABASE=hr_scanning_dev
   ```

3. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

### Production Environment

1. **Configure production environment:**
   ```bash
   # Copy production template
   cp .env.production .env
   
   # Edit .env with your production values:
   # - Set secure APP_KEY
   # - Set secure DB_PASSWORD
   # - Configure OPENAI_API_KEY if needed
   ```

2. **Start all services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run migrations (first time only):**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app node ace migration:run
   ```

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- At least 2GB RAM available for containers

## 🗂️ File Structure

```
├── docker-compose.dev.yml      # Development environment (PostgreSQL only)
├── docker-compose.prod.yml     # Production environment (Full stack)
├── Dockerfile                  # Application container definition
├── .env                        # Current environment configuration
├── .env.example               # Development environment template
├── .env.production            # Production environment template
└── docker/                    # Docker configuration files
    ├── nginx/                 # Nginx configuration (production)
    └── postgres/              # PostgreSQL initialization scripts
```

## 🔧 Configuration Details

### Development Environment (`docker-compose.dev.yml`)

**Services:**
- **PostgreSQL 15**: Database server on port 5433
- **Redis 7**: Caching server on port 6379 (optional)

**Features:**
- Persistent data volumes
- Health checks
- Development-optimized PostgreSQL settings
- Network isolation

### Production Environment (`docker-compose.prod.yml`)

**Services:**
- **PostgreSQL 15**: Production database with optimized settings
- **AdonisJS App**: Application server on port 3333
- **Redis 7**: Caching and session storage
- **Nginx**: Reverse proxy and static file serving (optional)

**Features:**
- Resource limits and reservations
- Health checks and restart policies
- Production-optimized configurations
- SSL/TLS ready (Nginx)
- Persistent volumes for data and uploads

## 🔐 Environment Variables

### Database Configuration
```bash
DB_CONNECTION=postgres          # Database type (PostgreSQL only)
DB_HOST=localhost              # Database host
DB_PORT=5433                   # Database port (5433 for dev, 5432 for prod)
DB_USERNAME=hr_user            # Database username
DB_PASSWORD=hr_password_dev    # Database password
DB_DATABASE=hr_scanning_dev    # Database name
DB_SSL=false                   # Enable SSL connection
DB_POOL_MIN=2                  # Minimum connection pool size
DB_POOL_MAX=10                 # Maximum connection pool size
DB_DEBUG=false                 # Enable query debugging
```

### Application Configuration
```bash
NODE_ENV=development           # Environment (development/production)
PORT=3333                      # Application port
HOST=localhost                 # Application host (0.0.0.0 for production)
APP_KEY=your-secret-key        # 32-character encryption key
LOG_LEVEL=info                 # Logging level
SESSION_DRIVER=cookie          # Session storage driver
DRIVE_DISK=fs                  # File storage driver
OPENAI_API_KEY=your-key        # OpenAI API key (optional)
```

## 🛠️ Common Commands

### Development
```bash
# Start PostgreSQL only
docker-compose -f docker-compose.dev.yml up -d postgres

# View PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs -f postgres

# Connect to PostgreSQL
docker exec -it hr-scanning-postgres-dev psql -U hr_user -d hr_scanning_dev

# Stop development services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (⚠️ deletes data)
docker-compose -f docker-compose.dev.yml down -v
```

### Production
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Scale application (multiple instances)
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Update application
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app

# Backup database
docker exec hr-scanning-postgres-prod pg_dump -U hr_user hr_scanning_prod > backup.sql

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

### Database Management
```bash
# Run migrations
node ace migration:run

# Rollback migrations
node ace migration:rollback

# Reset database
node ace migration:reset

# Check migration status
node ace migration:status

# Create new migration
node ace make:migration create_new_table
```

## 🔍 Troubleshooting

### Port Conflicts
If you get "port already allocated" errors:

1. **Check what's using the port:**
   ```bash
   lsof -i :5432  # or :5433
   ```

2. **Change the port in docker-compose.dev.yml:**
   ```yaml
   ports:
     - "5434:5432"  # Use different external port
   ```

3. **Update .env accordingly:**
   ```bash
   DB_PORT=5434
   ```

### Database Connection Issues
1. **Verify PostgreSQL is running:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. **Check PostgreSQL logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

3. **Test connection:**
   ```bash
   docker exec hr-scanning-postgres-dev pg_isready -U hr_user
   ```

### Application Issues
1. **Check application logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. **Verify environment variables:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app env | grep DB_
   ```

3. **Check health status:**
   ```bash
   curl http://localhost:3333/health
   ```

## 📊 Monitoring

### Health Checks
All services include health checks:
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping`
- **Application**: HTTP health endpoint
- **Nginx**: HTTP status check

### Resource Usage
```bash
# View resource usage
docker stats

# View specific service resources
docker-compose -f docker-compose.prod.yml exec app top
```

## 🔒 Security Considerations

### Production Security
1. **Change default passwords** in `.env.production`
2. **Use strong APP_KEY** (generate with `node ace generate:key`)
3. **Enable SSL** for database connections if needed
4. **Configure firewall** to restrict database access
5. **Regular security updates** for Docker images
6. **Backup strategy** for persistent data

### Network Security
- Services communicate through isolated Docker networks
- Database is not exposed externally in production
- Nginx handles SSL termination and security headers

## 📈 Performance Tuning

### PostgreSQL Optimization
The production configuration includes optimized settings:
- Shared buffers: 512MB
- Effective cache size: 2GB
- Work memory: 8MB
- Connection pooling: 5-20 connections

### Application Optimization
- Multi-stage Docker builds for smaller images
- Non-root user for security
- Resource limits to prevent resource exhaustion
- Health checks for automatic recovery

## 🗃️ Database Management

This application uses PostgreSQL as the primary and only supported database. All database operations are optimized for PostgreSQL's features and performance characteristics.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker and application logs
3. Verify environment configuration
4. Check network connectivity between services

---

**Note**: This setup supports both development and production environments. Always test changes in development before deploying to production.
