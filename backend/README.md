# Apartment Search Organiser

A Node.js/Express backend for searching and organizing apartment listings, including neighborhood information, commute times, and favorite listings management.

## Features
- RESTful API for apartment listings
- User authentication with JWT
- Favorite listings management
- Neighborhood and commute info endpoints
- Comprehensive test suite with Jest
- Linting and formatting with ESLint and Prettier

## Project Structure

```
backend/src/
  controllers/      # Route handler logic (see index.js for exports)
  models/           # Mongoose models (see index.js for exports)
  routes/           # Express route definitions (see index.js for exports)
  middleware/       # Express middleware (see index.js for exports)
  utils/            # Utility modules
  config/           # Configuration files (e.g., Swagger)
  __tests__/        # Test files
  app.js            # Main Express app setup
```

- Each major directory has an `index.js` that exports all modules for easier imports and maintainability.
- Key sections of code are marked with `// IMPORTANT:` or `// TODO:` comments for clarity and future work.

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud)

### Installation
```bash
# Clone the repository
https://github.com/colaone1/Backend-Environment-and-API-Structure.git
cd Backend-Environment-and-API-Structure

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Running the Server
```bash
npm start
# or
yarn start
```

### Running Tests
```bash
npm test
# or
yarn test
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details. 