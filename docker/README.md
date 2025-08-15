# Percy Tech Local Development Environment

This directory contains Docker configurations for local development and testing.

## 🚀 Quick Start

1. **Copy environment variables** (you'll need to create a `.env` file based on the configuration needs):

   ```bash
   # Create your own .env file with the required variables
   # See the main README for environment variable documentation
   ```

2. **Start the development environment**:

   ```bash
   docker-compose up -d
   ```

3. **Check service status**:

   ```bash
   docker-compose ps
   ```

4. **View logs**:

   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f db
   ```

5. **Stop the environment**:
   ```bash
   docker-compose down
   ```

## 📋 Services

| Service             | Port | Description           | Admin URL             |
| ------------------- | ---- | --------------------- | --------------------- |
| **MySQL**           | 3306 | Main database         | -                     |
| **Redis**           | 6379 | Cache & sessions      | -                     |
| **MinIO**           | 9000 | S3-compatible storage | http://localhost:9001 |
| **Adminer**         | 8080 | Database admin        | http://localhost:8080 |
| **Redis Commander** | 8081 | Redis admin           | http://localhost:8081 |
| **phpMyAdmin**      | 8082 | Alternative DB admin  | http://localhost:8082 |
| **MailHog**         | 8025 | Email testing         | http://localhost:8025 |

## 🗂️ Directory Structure

```
docker/
├── mysql/
│   ├── conf.d/          # MySQL configuration files
│   └── init/            # Database initialization scripts
├── redis/
│   └── redis.conf       # Redis configuration
└── README.md           # This file
```

## 🔧 Configuration Files

### MySQL Configuration

- **my.cnf**: Performance and security settings
- **01-init.sql**: Database initialization script

### Redis Configuration

- **redis.conf**: Redis server configuration with security settings

## 💾 Data Persistence

All data is persisted using Docker volumes:

- `mysql_data`: Database files
- `redis_data`: Redis data and AOF files
- `minio_data`: Object storage files

## 🛠️ Development Commands

### Database Operations

```bash
# Run migrations
docker-compose exec db mysql -u percytech -p percytech_dev

# Access MySQL CLI
docker-compose exec db mysql -u root -p

# Import SQL file
docker-compose exec -T db mysql -u percytech -p percytech_dev < backup.sql
```

### Redis Operations

```bash
# Access Redis CLI
docker-compose exec redis redis-cli -a redis_password

# Monitor Redis commands
docker-compose exec redis redis-cli -a redis_password MONITOR
```

### MinIO Operations

```bash
# MinIO client (mc) setup
docker run --rm -it --network percytech-bryan_percytech-network \
  minio/mc:latest alias set local http://minio:9000 minioadmin minioadmin123

# Create a bucket
docker run --rm -it --network percytech-bryan_percytech-network \
  minio/mc:latest mb local/percytech-files
```

## 🔒 Security Notes

- **Change default passwords** in production environments
- **Redis password** is required for connections
- **MySQL** uses native password authentication
- **MinIO** credentials should be updated for production use

## 🧪 Testing

For testing, you can use the `percytech_test` database:

```bash
# Switch to test database
DB_NAME=percytech_test docker-compose up -d
```

## 📱 Mobile/Remote Access

To access services from mobile devices or other machines on your network:

1. Find your machine's IP address
2. Update environment variables to use `0.0.0.0` instead of `localhost`
3. Configure firewall to allow access to the required ports

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Modify ports in `docker-compose.override.yml`
2. **Permission issues**: Check Docker volume permissions
3. **Memory issues**: Adjust memory limits in configurations
4. **Network issues**: Restart Docker or recreate networks

### Useful Commands

```bash
# Recreate containers
docker-compose up -d --force-recreate

# Remove all data (fresh start)
docker-compose down -v

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [MinIO Documentation](https://docs.min.io/)
