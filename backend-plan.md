# Backend Project Plan - Apartment Search Organiser
*Last Updated: 02/06/25*

## Technical Stack
- Node.js with Express
- MongoDB/PostgreSQL for database
- JWT for authentication
- Google Maps API for location/commute features

## Core Backend Features

### Authentication & User Management
- User registration and login system
- JWT token-based authentication
- Password hashing and security
- User profile management
- Session handling

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  createdAt: Date,
  favorites: [ObjectId] // References to apartment listings
}
```

#### Apartment Listings Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  neighborhood: String,
  features: [String],
  images: [String],
  postedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### Favorites Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  listingId: ObjectId,
  createdAt: Date
}
```

## Implementation Plan

### Phase 1: Project Setup (Days 1-3)
- [ ] Set up Node.js/Express project structure
- [ ] Configure development environment
- [ ] Set up database connection
- [ ] Create initial database schema
- [ ] Set up basic error handling

### Phase 2: Authentication System (Days 4-6)
- [ ] Implement user registration
- [ ] Implement user login/logout
- [ ] Set up JWT authentication
- [ ] Create user profile management
- [ ] Implement authentication middleware

### Phase 3: Apartment Listings API (Days 7-10)
- [ ] Create listing model/schema
- [ ] Implement CRUD operations
- [ ] Add image handling
- [ ] Implement search functionality
- [ ] Add filtering capabilities

### Phase 4: Favorites System (Days 11-13)
- [ ] Create favorites model/schema
- [ ] Implement add/remove favorite endpoints
- [ ] Create favorites retrieval endpoints
- [ ] Add favorites filtering

### Phase 5: Location & Commute Features (Days 14-16)
- [ ] Integrate Google Maps API
- [ ] Implement location search
- [ ] Create commute time calculation
- [ ] Add location-based filtering

### Phase 6: Testing & Optimization (Days 17-18)
- [ ] Write unit tests
- [ ] Implement error handling
- [ ] Add input validation
- [ ] Optimize database queries
- [ ] Add API documentation

### Phase 7: Deployment (Days 19-20)
- [ ] Set up production environment
- [ ] Configure security measures
- [ ] Set up monitoring
- [ ] Deploy application
- [ ] Final testing

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/profile
- PUT /api/auth/profile

### Listings
- GET /api/listings
- POST /api/listings
- GET /api/listings/:id
- PUT /api/listings/:id
- DELETE /api/listings/:id

### Favorites
- GET /api/favorites
- POST /api/favorites/:listingId
- DELETE /api/favorites/:listingId

### Location
- GET /api/location/search
- GET /api/location/commute

## Security Considerations
- Implement rate limiting
- Add input sanitization
- Set up CORS policies
- Implement request validation
- Add security headers

## Testing Strategy
- Unit tests for all endpoints
- Integration tests for API flows
- Database connection tests
- Authentication flow tests
- Error handling tests 