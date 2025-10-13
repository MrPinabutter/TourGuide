# 🗺️ Tour Guide API

<div align="center">

**A collaborative trip planning platform where users can create detailed itineraries and invite friends to collaborate on amazing adventures.**

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

</div>

## 📖 Description

Tour Guide is a comprehensive backend API for a collaborative trip planning application. Users can create detailed travel itineraries with specific points of interest, invite friends to collaborate, manage trip visibility, and build a community around shared travel experiences.

### ✨ Key Features

- 🔐 **Multi-Authentication System**: Google OAuth + Email/Password authentication
- 👥 **Friendship Management**: Send requests, accept/reject, block users
- 🗓️ **Trip Planning**: Create trips with detailed itineraries and steps
- 👥 **Collaborative Planning**: Invite friends with role-based permissions (Creator, Admin, Member)
- 📍 **Location-Based Steps**: Add places to visit with coordinates and time slots
- 💬 **Commenting System**: Discuss and comment on trip steps
- 🔒 **Privacy Controls**: Public, Private, and Friends-Only trip visibility
- 🎫 **Invitation System**: Share trips via secure invitation tokens

### 🏗️ Built With

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT + Google OAuth 2.0
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Docker & Docker Compose** (optional, for containerized setup)

### 🐳 Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/MrPinabutter/tour-guide.git
   cd tour-guide
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec api npx prisma migrate dev
   ```

5. **Access the application**
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api
   - Database: localhost:5432

### 💻 Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Database setup**
   ```bash
   # Start PostgreSQL locally or use Docker
   docker run --name tour-guide-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tourguide -p 5432:5432 -d postgres:16-alpine
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL and other variables
   ```

4. **Run migrations and generate Prisma client**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

## 🔧 Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tourguide?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Google OAuth (get from Google Developer Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google-redirect"

# CORS Configuration (for production)
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Server Configuration
NODE_ENV="development"
PORT=3000
```

### 🔑 Getting Google OAuth Credentials

1. Go to [Google Developer Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google-redirect`
6. Copy Client ID and Client Secret to your `.env` file

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at: `http://localhost:3000/api`

### Main Endpoints

#### Authentication
- `POST /auth/login` - Email/password login
- `POST /auth/register` - Create new account
- `GET /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

#### Users
- `GET /user/profile` - Get user profile
- `GET /user/search` - Search users
- `PUT /user/:id` - Update user profile
- `DELETE /user/:id` - Delete user account

#### Trips
- `GET /trip` - Get user's trips
- `GET /trip/public` - Get public trips
- `GET /trip/:id` - Get specific trip
- `POST /trip` - Create new trip
- `PUT /trip/:id` - Update trip
- `DELETE /trip/:id` - Delete trip
- `POST /trip/join-trip` - Join trip via invitation token

#### Steps (Trip Locations)
- `GET /step/:id` - Get step details
- `POST /step` - Create new step
- `PUT /step/:id` - Update step
- `DELETE /step/:id` - Delete step

#### Friendship
- `GET /friendship/list` - Get friends list
- `GET /friendship/pending` - Get pending requests
- `POST /friendship/request` - Send friend request
- `PUT /friendship/:id/accept` - Accept friend request
- `PUT /friendship/:id/reject` - Reject friend request

## 🗄️ Database Schema

### Core Models

- **User**: User accounts with authentication and profile data
- **Trip**: Travel itineraries with metadata and settings
- **TripMember**: Join table managing user permissions in trips
- **Step**: Individual locations/activities within a trip
- **Comment**: User comments on trip steps
- **Friendship**: User relationships and friend requests

### Key Relationships

```
User 1:N TripMember N:1 Trip
User 1:N Step (as creator)
User 1:N Comment
User N:N User (via Friendship)
Trip 1:N Step
Step 1:N Comment
```

## 🛠️ Available Scripts

```bash
# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debug mode

# Production
npm run build          # Build the application
npm run start:prod     # Start production server

# Database
npx prisma migrate dev    # Run database migrations
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma generate      # Generate Prisma client

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Run tests with coverage

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs api    # View API logs
```

## 📱 React Native Integration

This backend is designed to work seamlessly with React Native applications:

### CORS Configuration
The API is configured to accept requests from:
- React Native Metro bundler (ports 19000, 19006)
- Android emulator (10.0.2.2)
- iOS simulator (localhost)
- Physical devices on local network

### API Usage in React Native
```javascript
// Example API configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000' // Android emulator
  : 'https://your-production-api.com';

// Authentication
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Rate Limiting**: API rate limiting (configurable)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## 📂 Project Structure

```
tour-guide/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── decorators/       # Custom decorators
│   │   ├── guards/           # Auth guards
│   │   └── strategies/       # Passport strategies
│   ├── friendship/           # Friendship management
│   ├── prisma-client-exception/ # Prisma error handling
│   ├── step/                 # Trip steps/locations
│   ├── trip/                 # Trip management
│   ├── trip-member/          # Trip membership
│   ├── user/                 # User management
│   └── utils/                # Shared utilities
├── prisma/
│   ├── migrations/           # Database migrations
│   └── schema.prisma         # Database schema
├── generated/
│   └── prisma/               # Generated Prisma client
├── docker-compose.yml        # Docker services
├── Dockerfile               # Container definition
└── .env.example             # Environment template
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add some amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use NestJS conventions and patterns
- Write tests for new features
- Update documentation as needed
- Ensure proper error handling
- Follow the existing code style

## 🐛 Known Issues & Roadmap

See [BACKEND_TODO.md](./BACKEND_TODO.md) for a comprehensive list of planned improvements and known issues.

### Upcoming Features
- [ ] Real-time notifications with WebSocket
- [ ] File upload for trip photos
- [ ] Advanced search and filtering
- [ ] Trip recommendations
- [ ] Social features (likes, shares)
- [ ] Mobile push notifications

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [PostgreSQL](https://www.postgresql.org/) - Advanced open source database

## 📞 Support

If you have any questions or need help with setup, please:

1. Check the [documentation](http://localhost:3000/api) 
2. Review [existing issues](https://github.com/MrPinabutter/tour-guide/issues)
3. Create a new issue with detailed information

---

<div align="center">

**Happy Traveling! 🌍✈️**

Made with ❤️ for travelers and adventurers everywhere.

</div>