# Apartment Search Organiser - Project Plan
*Last Updated: 02/06/25*

## Project Overview
**Time Frame:** 20 days

### Description
A platform for searching and organizing apartment listings with neighborhood information, commute times, and favorite listings management. Users can post apartment listings, describe neighborhoods, and manage their favorite listings. The platform includes commute time calculations and location-based features.

### Core Features
- User authentication and profile management
- Apartment listing creation and management
- Neighborhood information and descriptions
- Favorite listings system
- Commute time calculation
- Location-based search and filtering

## Technical Stack

### Frontend
- Next.js (React framework)
- Tailwind CSS for styling
- React Query for data fetching
- React Hook Form for forms

### Backend
- Node.js with Express
- MongoDB/PostgreSQL for database
- JWT for authentication
- Google Maps API for location/commute features

## User Stories

1. **Authentication & Profile**
   - As a user, I want to register to see and add apartment listings and manage favorites
   - As a user, I want to login/logout to secure my account
   - As a user, I want to manage my profile (password, username, email)

2. **Listing Management**
   - As a user, I want to add, edit, and delete listings
   - As a user, I want to contact the estate agent for a listing
   - As a user, I want to see my personally listed apartments

3. **Favorites System**
   - As a user, I want to add/remove listings to/from favorites
   - As a user, I want to view all my favorite listings
   - As a user, I want visual feedback when adding/removing favorites

4. **Location & Commute**
   - As a user, I want to calculate commute times to specific locations
   - As a user, I want to compare different transportation options
   - As a user, I want to filter listings by location

## Implementation Plan

### Phase 1: Project Setup and Basic Structure (Days 1-3)
- [ ] Set up project repository and basic structure
- [ ] Create initial database schema
- [ ] Set up basic frontend structure with React/Next.js
- [ ] Set up basic backend structure with Node.js/Express
- [ ] Configure development environment and dependencies

### Phase 2: Core Features - User Authentication (Days 4-6)
- [ ] Implement user registration
- [ ] Implement user login/logout
- [ ] Create user profile management
- [ ] Implement authentication middleware

### Phase 3: Core Features - Apartment Listings (Days 7-10)
- [ ] Create apartment listing model/schema
- [ ] Implement CRUD operations for listings
- [ ] Create listing creation form
- [ ] Implement listing editing functionality
- [ ] Implement listing deletion
- [ ] Add image upload functionality

### Phase 4: Favorites System (Days 11-13)
- [ ] Create favorites model/schema
- [ ] Implement add/remove favorite functionality
- [ ] Create favorites page
- [ ] Implement favorites filtering and sorting
- [ ] Add favorite indicators to listings

### Phase 5: Location and Commute Features (Days 14-16)
- [ ] Integrate with mapping API
- [ ] Implement location search and autocomplete
- [ ] Create commute time calculation feature
- [ ] Implement commute time display
- [ ] Add location-based filtering

### Phase 6: UI/UX and Polish (Days 17-18)
- [ ] Implement responsive design
- [ ] Add loading states
- [ ] [Optional] Add pagination for listings
- [ ] [Optional] Add user feedback and notifications

### Phase 7: Testing and Deployment (Days 19-20)
- [ ] Write unit tests
- [ ] Perform integration testing
- [ ] Fix bugs and issues
- [ ] Prepare for deployment
- [ ] Deploy application
- [ ] Final testing in production environment

## User Guide

### Posting Listings
1. Create account or login
2. Click "Create Post" button
3. Fill in details:
   - Title
   - Description
   - Location
   - Price
   - [Optional] External URL for auto-fill

### Managing Listings
- **Edit**: Access post → Click edit button (owner only)
- **Delete**: Access post → Click delete button (owner only)
- **Favorite**: Click star button on any listing
- **View Favorites**: Access favorites page from profile

### Commute Time Feature
1. Open apartment listing
2. Click "Commute" button
3. Enter destination
4. View commute times for different transport options

## Testing
We will utilize the existing testing setup from: https://github.com/colaone1/Open-Source-Testing-Setup

## Notes
- Reuse and adapt code from previous projects where applicable
- Focus on user experience and intuitive interface
- Implement proper error handling and loading states
- Ensure responsive design for all screen sizes 