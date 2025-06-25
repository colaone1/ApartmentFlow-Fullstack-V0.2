import { render, screen, fireEvent } from '@testing-library/react'
import ListingCard from '../ListingCard'

const mockApartment = {
  _id: '1',
  title: 'Test Apartment',
  description: 'A beautiful test apartment',
  price: 1500,
  location: {
    address: {
      street: '123 Test St',
      city: 'Test City',
      country: 'Test Country'
    }
  },
  bedrooms: 2,
  bathrooms: 1,
  area: 800,
  amenities: ['Parking', 'Gym'],
  status: 'available',
  images: [
    {
      url: '/test-image.jpg',
      isMain: true
    }
  ]
}

describe('ListingCard', () => {
  it('renders apartment information correctly', () => {
    render(<ListingCard apartment={mockApartment} />)
    
    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
    expect(screen.getByText('A beautiful test apartment')).toBeInTheDocument()
    expect(screen.getByText('£1,500')).toBeInTheDocument()
    expect(screen.getByText('123 Test St, Test City, Test Country')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // bedrooms
    expect(screen.getByText('1')).toBeInTheDocument() // bathrooms
    expect(screen.getByText('800')).toBeInTheDocument() // area
  })

  it('displays amenities correctly', () => {
    render(<ListingCard apartment={mockApartment} />)
    
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Gym')).toBeInTheDocument()
  })

  it('shows status badge', () => {
    render(<ListingCard apartment={mockApartment} />)
    
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('handles missing images gracefully', () => {
    const apartmentWithoutImages = { ...mockApartment, images: [] }
    render(<ListingCard apartment={apartmentWithoutImages} />)
    
    // Should still render the card without crashing
    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
  })
}) 