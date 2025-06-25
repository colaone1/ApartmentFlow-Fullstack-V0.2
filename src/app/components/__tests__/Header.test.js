import { render, screen } from '@testing-library/react'
import Header from '../Header'

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    user: null,
    logout: jest.fn(),
  }),
}))

describe('Header', () => {
  it('renders the header with logo', () => {
    render(<Header />)
    expect(screen.getByAltText(/ApartmentsFlow logo/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText(/Listings/i)).toBeInTheDocument()
    expect(screen.getByText(/Add/i)).toBeInTheDocument()
    expect(screen.getByText(/Home/i)).toBeInTheDocument()
    expect(screen.getByText(/Favorites/i)).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Header />)
    expect(screen.getByLabelText(/Toggle menu/i)).toBeInTheDocument()
  })
}) 