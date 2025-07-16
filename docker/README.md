# Docker Setup for Data Reader (Development Only)

⚠️ **This Docker configuration is for LOCAL DEVELOPMENT only. Do not use in production.**

This folder contains Docker configuration for running the Data Reader application with MongoDB in a development environment.

## Quick Start

### Option 1: MongoDB Only (Recommended for Development)

```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# Access MongoDB on localhost:27017
# Access Mongo Express UI on http://localhost:8081
# Username: admin, Password: password123

# Run your application locally for development
cd ../data-reader
npm start
```

### Option 2: Full Stack (MongoDB + Data Reader App)

```bash
# Start all services including the data-reader application
docker-compose -f docker-compose.full.yml up -d

# Access Data Reader API on http://localhost:3000
# Access MongoDB on localhost:27017
# Access Mongo Express UI on http://localhost:8081
```

## Development Setup

### Recommended Development Workflow

1. **Start MongoDB only** with Docker
2. **Run application locally** for hot reloading and debugging
3. **Use Mongo Express** for database inspection

```bash
# Terminal 1: Start MongoDB
cd docker
docker-compose up -d

# Terminal 2: Run application locally
cd ../data-reader
npm start
```

## Services

### MongoDB (Development)

- **Port:** 27017
- **Database:** data-reader
- **Root User:** admin/password123
- **App User:** data-reader-user/data-reader-password
- **Purpose:** Local development database

### Data Reader Application

- **Port:** 3000
- **Health Check:** http://localhost:3000/health
- **API Endpoints:** http://localhost:3000/process
- **Hot Reload:** Available when running locally

### Mongo Express (Development UI)

- **Port:** 8081
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** password123
- **Purpose:** Database inspection and management

## Development Environment Variables

Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

**For local development, update your `data-reader/.env`:**

```env
MONGO_URI=mongodb://data-reader-user:data-reader-password@localhost:27017/data-reader
NODE_ENV=development
PORT=3000
```

## Database Initialization

The `init-mongo.js` script automatically:

- Creates the `data-reader` database
- Creates application user with read/write permissions
- Creates collections with proper indexes
- Sets up unique constraints on `uuid` and `personalId`

## Volumes

- **mongodb_data:** Persistent MongoDB data storage (development data)
- **logs:** Application log files (mounted from host)
- **data:** Read-only access to data files (mounted from host)

## Development Commands

```bash
# Start MongoDB for development
docker-compose up -d

# View MongoDB logs
docker-compose logs -f mongodb

# Stop MongoDB
docker-compose down

# Reset database (WARNING: deletes all development data)
docker-compose down -v
docker-compose up -d

# Access MongoDB shell
docker exec -it data-reader-mongodb mongosh -u admin -p password123

# Access application database
docker exec -it data-reader-mongodb mongosh -u data-reader-user -p data-reader-password data-reader
```

## Development Tips

### Hot Reloading

- Run the application locally with `npm start` for TypeScript hot reloading
- MongoDB runs in Docker for consistency
- Use Mongo Express to inspect data during development

### Database Reset

```bash
# Reset everything and start fresh
docker-compose down -v
docker-compose up -d
```

### Data Inspection

- Use Mongo Express at http://localhost:8081
- Or connect directly: `mongodb://localhost:27017/data-reader`

## ⚠️ Development Only Features

This configuration includes:

- **Default passwords** (not secure for production)
- **Exposed ports** for easy development access
- **Mongo Express** for database management
- **Persistent volumes** for development data
- **No SSL/TLS** encryption
- **No authentication** for Mongo Express in production

## Production Considerations

For production deployment:

- Use proper secrets management
- Implement SSL/TLS encryption
- Use production-grade MongoDB configuration
- Remove Mongo Express or secure it properly
- Use environment-specific configurations
- Implement proper backup strategies
