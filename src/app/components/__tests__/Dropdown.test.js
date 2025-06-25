import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dropdown from '../Dropdown'
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

// Mock the API client
jest.mock('../../../../apiClient/apiClient', () => ({
  ApiClient: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn()
  }
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

describe('Dropdown', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders avatar button when user is logged in', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    expect(screen.getByRole('button', { name: /avatar/i })).toBeInTheDocument()
  })

  it('shows user avatar image', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarImg = screen.getByAltText('avatar')
    expect(avatarImg).toBeInTheDocument()
    expect(avatarImg).toHaveAttribute('src', '/default-avatar.png')
  })

  it('opens dropdown menu when avatar button is clicked', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    fireEvent.click(avatarButton)

    expect(screen.getByText(/my profile/i)).toBeInTheDocument()
    expect(screen.getByText(/logout/i)).toBeInTheDocument()
  })

  it('closes dropdown menu when clicking outside', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    fireEvent.click(avatarButton)

    // Verify menu is open
    expect(screen.getByText(/my profile/i)).toBeInTheDocument()

    // Click outside
    fireEvent.click(document.body)

    // Verify menu is closed
    expect(screen.queryByText(/my profile/i)).not.toBeInTheDocument()
  })

  it('navigates to profile page when My profile link is clicked', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    fireEvent.click(avatarButton)

    const profileLink = screen.getByText(/my profile/i)
    expect(profileLink).toHaveAttribute('href', '/profile')
  })

  it('handles logout when Logout button is clicked', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.logout.mockResolvedValue({ success: true })

    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    fireEvent.click(avatarButton)

    const logoutButton = screen.getByText(/logout/i)
    
    await act(async () => {
      fireEvent.click(logoutButton)
    })

    await waitFor(() => {
      expect(ApiClient.logout).toHaveBeenCalled()
    })
  })

  it('closes dropdown after clicking My profile link', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    fireEvent.click(avatarButton)

    const profileLink = screen.getByText(/my profile/i)
    fireEvent.click(profileLink)

    // Menu should close after navigation
    expect(screen.queryByText(/my profile/i)).not.toBeInTheDocument()
  })

  it('closes dropdown after clicking Logout button', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.logout.mockResolvedValue({ success: true })

    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    fireEvent.click(avatarButton)

    const logoutButton = screen.getByText(/logout/i)
    
    await act(async () => {
      fireEvent.click(logoutButton)
    })

    // Menu should close after logout
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument()
  })

  it('shows login link when user is not logged in', () => {
    renderWithAuth(<Dropdown />)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    fireEvent.click(avatarButton)

    expect(screen.getByText(/login/i)).toBeInTheDocument()
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument()
  })

  it('handles multiple rapid clicks on avatar button', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(<Dropdown />, mockUser)

    const avatarButton = screen.getByRole('button', { name: /avatar/i })
    
    // Multiple rapid clicks
    fireEvent.click(avatarButton)
    fireEvent.click(avatarButton)
    fireEvent.click(avatarButton)

    // Should still show menu
    expect(screen.getByText(/my profile/i)).toBeInTheDocument()
  })
}) 