import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { act } from 'react'

// Mock the API client
jest.mock('../../../../apiClient/apiClient', () => ({
  ApiClient: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn()
  }
}))

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

// Test component to access context
const TestComponent = () => {
  const { isLoggedIn, user, login, logout, register } = useAuth()
  
  return (
    <div>
      <div data-testid="login-status">{isLoggedIn ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="user-info">{user ? JSON.stringify(user) : 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')} data-testid="login-btn">
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={() => register('Test User', 'test@example.com', 'password')} data-testid="register-btn">
        Register
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('provides initial authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out')
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user')
  })

  it('loads user from localStorage on mount', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', 'mock-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in')
    expect(screen.getByTestId('user-info')).toHaveTextContent(JSON.stringify(mockUser))
  })

  it('handles successful login', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.login.mockResolvedValue({
      success: true,
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      token: 'mock-token'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'))
    })

    await waitFor(() => {
      expect(ApiClient.login).toHaveBeenCalledWith('test@example.com', 'password')
    })
  })

  it('handles login failure', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.login.mockRejectedValue(new Error('Invalid credentials'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'))
    })

    await waitFor(() => {
      expect(ApiClient.login).toHaveBeenCalledWith('test@example.com', 'password')
    })
  })

  it('handles successful registration', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.register.mockResolvedValue({
      success: true,
      data: {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com'
      },
      token: 'mock-token'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('register-btn'))
    })

    await waitFor(() => {
      expect(ApiClient.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password')
    })
  })

  it('handles registration failure', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.register.mockRejectedValue(new Error('Email already exists'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('register-btn'))
    })

    await waitFor(() => {
      expect(ApiClient.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password')
    })
  })

  it('handles logout', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.logout.mockResolvedValue({ success: true })

    // Set up initial logged-in state
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', 'mock-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Verify initial state
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in')

    // Logout
    await act(async () => {
      fireEvent.click(screen.getByTestId('logout-btn'))
    })

    await waitFor(() => {
      expect(ApiClient.logout).toHaveBeenCalled()
    })
  })

  it('handles network errors during login', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.login.mockRejectedValue(new Error('Network error'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'))
    })

    await waitFor(() => {
      expect(ApiClient.login).toHaveBeenCalledWith('test@example.com', 'password')
    })
  })

  it('handles network errors during registration', async () => {
    const { ApiClient } = require('../../../../apiClient/apiClient')
    ApiClient.register.mockRejectedValue(new Error('Network error'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('register-btn'))
    })

    await waitFor(() => {
      expect(ApiClient.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password')
    })
  })
}) 