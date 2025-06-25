import { render, screen } from '@testing-library/react'
import ProfileCard from '../ProfileCard'
import { AuthProvider } from '../../context/AuthContext'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

const renderWithAuth = (component, user = null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', 'mock-token')
  } else {
    localStorage.clear()
  }

  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('ProfileCard', () => {
  const mockUser = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('renders profile card with user information', () => {
    renderWithAuth(<ProfileCard user={mockUser} />, mockUser)

    expect(screen.getByText(/name:/i)).toBeInTheDocument()
    expect(screen.getByText(/email:/i)).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('renders user avatar', () => {
    renderWithAuth(<ProfileCard user={mockUser} />, mockUser)

    const avatar = screen.getByAltText('Avatar')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', '/default-avatar.png')
  })

  it('renders edit profile button', () => {
    renderWithAuth(<ProfileCard user={mockUser} />, mockUser)

    expect(screen.getByText(/edit profile/i)).toBeInTheDocument()
  })

  it('handles missing user data gracefully', () => {
    const incompleteUser = { _id: '1' }
    renderWithAuth(<ProfileCard user={incompleteUser} />, incompleteUser)

    expect(screen.getByText(/edit profile/i)).toBeInTheDocument()
  })

  it('handles null user', () => {
    renderWithAuth(<ProfileCard user={null} />)

    expect(screen.getByText(/edit profile/i)).toBeInTheDocument()
  })

  it('handles user with custom avatar', () => {
    const userWithAvatar = { 
      ...mockUser, 
      avatar: 'https://example.com/avatar.jpg' 
    }
    renderWithAuth(<ProfileCard user={userWithAvatar} />, userWithAvatar)

    const avatar = screen.getByAltText('Avatar')
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('handles long user names', () => {
    const userWithLongName = { 
      ...mockUser, 
      name: 'This is a very long user name that might overflow the container' 
    }
    renderWithAuth(<ProfileCard user={userWithLongName} />, userWithLongName)

    expect(screen.getByText('This is a very long user name that might overflow the container')).toBeInTheDocument()
  })

  it('handles long email addresses', () => {
    const userWithLongEmail = { 
      ...mockUser, 
      email: 'very.long.email.address.that.might.overflow@very.long.domain.com' 
    }
    renderWithAuth(<ProfileCard user={userWithLongEmail} />, userWithLongEmail)

    expect(screen.getByText('very.long.email.address.that.might.overflow@very.long.domain.com')).toBeInTheDocument()
  })

  it('handles special characters in user name', () => {
    const userWithSpecialChars = { 
      ...mockUser, 
      name: 'Test User @#$%^&*()' 
    }
    renderWithAuth(<ProfileCard user={userWithSpecialChars} />, userWithSpecialChars)

    expect(screen.getByText('Test User @#$%^&*()')).toBeInTheDocument()
  })

  it('handles special characters in email', () => {
    const userWithSpecialEmail = { 
      ...mockUser, 
      email: 'test+special@example.com' 
    }
    renderWithAuth(<ProfileCard user={userWithSpecialEmail} />, userWithSpecialEmail)

    expect(screen.getByText('test+special@example.com')).toBeInTheDocument()
  })
}) 