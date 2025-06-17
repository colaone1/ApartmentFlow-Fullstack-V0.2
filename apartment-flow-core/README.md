# Apartment Flow Core Service

## Overview
This service handles the core functionality of the Apartment Flow application, including apartment listings, user profiles, and basic search capabilities.

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
- Apartment CRUD operations
- User profile management
- Basic search and filtering
- Public/private listing management
- Image handling for apartments

## API Endpoints
- `/api/apartments/*` - Apartment management
- `/api/users/*` - User management
- `/api/profiles/*` - Profile management

## Development
1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development server: `npm run dev`

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
├── models/        # Database models
├── routes/        # API routes
├── services/      # Business logic
├── middleware/    # Custom middleware
└── utils/         # Helper functions
```

## Dependencies
- Express
- Mongoose
- JWT (for basic auth)
- File upload handling

## Contributing
1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License
MIT 