# Real Estate Portal Backend

A comprehensive backend API for a real estate portal built with Node.js, Express.js, TypeScript, MySQL, and Redis.

## Features

- **TypeScript** for type safety
- **Express.js** web framework
- **MySQL** database with connection pooling
- **Redis** for caching and session management
- **Security middleware** (Helmet, CORS, Rate limiting)
- **Input validation and sanitization**
- **JWT authentication** (ready for implementation)
- **File upload support** with Multer
- **Environment-based configuration**
- **Error handling and logging**

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── index.ts     # Main configuration
│   ├── database.ts  # MySQL connection setup
│   └── redis.ts     # Redis connection setup
├── controllers/     # Route controllers (empty, ready for implementation)
├── middleware/      # Custom middleware
│   └── security.ts  # Security middleware
├── models/          # Database models (empty, ready for implementation)
├── services/        # Business logic services (empty, ready for implementation)
├── types/           # TypeScript type definitions
│   └── index.ts     # Common types
├── utils/           # Utility functions
│   └── response.ts  # Response helpers
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- Redis (optional, for caching)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database and Redis credentials

## Configuration

Update the following environment variables in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=real_estate_portal
DB_USER=root
DB_PASSWORD=your_password

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Other configurations...
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm run lint` - Run ESLint (needs configuration)
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build directory

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server will start on `http://localhost:3000`

3. Health check endpoint: `GET /health`

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate limiting** - API rate limiting
- **Input validation** - Request validation and sanitization
- **XSS protection** - Cross-site scripting prevention
- **SQL injection protection** - Additional SQL injection prevention

## Database Connection

The application uses MySQL with connection pooling for optimal performance. The database connection includes:

- Connection pooling (10 connections)
- Automatic reconnection
- Error handling and retry logic
- Transaction support

## Redis Caching

Redis is used for:

- Session management
- Caching frequently accessed data
- Rate limiting storage

The Redis connection includes:

- Automatic reconnection
- Error handling
- Graceful degradation when Redis is unavailable

## Error Handling

The application includes comprehensive error handling:

- Global error handler
- Structured error responses
- Request validation errors
- Database connection errors
- Authentication errors

## Next Steps

This is the foundation setup. The next tasks in the implementation plan will add:

1. Database schema and migrations
2. User authentication system
3. Property management APIs
4. File upload functionality
5. Communication system
6. Admin dashboard APIs
7. Frontend React application

## License

ISC