# Apartment Flow Location Service

## Overview
This service handles all location-based functionality, including commute calculations, distance measurements, and map integrations.

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
- Commute time calculations
- Distance calculations
- Location search and geocoding
- Map integration
- Area statistics

## API Endpoints
- `/api/commute/*` - Commute calculations
- `/api/location/*` - Location services
- `/api/maps/*` - Map integrations

## Development
1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Configure Google Maps API key
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
├── services/      # Business logic
│   ├── maps/      # Google Maps integration
│   ├── commute/   # Commute calculations
│   └── location/  # Location services
├── routes/        # API routes
└── utils/         # Helper functions
```

## Dependencies
- Google Maps API
- Geocoding services
- Distance calculation libraries

## API Keys Required
- Google Maps API Key
- Geocoding API Key (if separate)

## Contributing
1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License
MIT 