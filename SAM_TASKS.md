# Sam's Tasks

## Week 1 – Foundations & Planning (Completed + Updates)
- ✅ Set up backend environment & API structure
- ✅ Created initial database schema
- Expanded "Listing" model with fields: isPublic, externalUrl, coordinates
- Stubbed Google Geocoding service for later integration

## Week 2 – Core Features Implementation
- ✅ Finalize roles & permissions model (admin, agent, user)
- ✅ Implement JWT authentication & authorization middleware
- CRUD for Listings:
  - Enforce isPublic access rules
  - Accept & store externalUrl
  - Hook in Geocoding service on create/update

## Week 3 – Advanced Features & Optimization
- ✅ Define Favorites model/schema
- Add Favorite endpoints: POST /favorites, GET /favorites/:userId, DELETE /favorites/:id
- Implement listing-filter API (price, bedrooms, geospatial radius)
- Write unit tests for Listing & Favorite services

## Week 4 – Final Features, Testing & Deployment
- Publish API docs with Swagger/OpenAPI
- Add indexes on coordinates & filter fields for performance
- ✅ Enforce API rate limiting (express-rate-limit)

## Next Immediate Tasks
- Implement basic caching for apartment listings
- Optimize MongoDB queries
- Add rate limiting middleware
- Implement request validation
- Add security headers 