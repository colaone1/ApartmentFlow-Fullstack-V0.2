# Apartment Flow Auth Service

## Overview
This service handles all authentication and authorization functionality, including user authentication, role management, and security policies.

## Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Features
- User authentication
- Role-based access control
- Session management
- Security policies
- Rate limiting

## API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/roles/*` - Role management
- `/api/sessions/*` - Session management

## Development
1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Configure JWT secret
5. Start development server: `npm run dev`

## Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure
```
src/
├── controllers/    # Request handlers
├── middleware/     # Auth middleware
├── services/      # Business logic
│   ├── auth/      # Authentication logic
│   ├── roles/     # Role management
│   └── sessions/  # Session handling
├── routes/        # API routes
└── utils/         # Helper functions
```

## Dependencies
- JWT
- bcrypt
- OAuth (if needed)
- Rate limiting middleware

## Security Considerations
- JWT token management
- Password hashing
- Rate limiting
- Session management
- Role-based access control

## Contributing
1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License
MIT 