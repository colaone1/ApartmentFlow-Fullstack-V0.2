import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Sidebar from '../Sidebar'
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

// Mock fetch globally
global.fetch = jest.fn()

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

describe('Sidebar', () => {
  const mockOnFilterChange = jest.fn()
  const mockOnPriceRangeChange = jest.fn()
  const mockOnBedroomChange = jest.fn()
  const mockOnBathroomChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    fetch.mockClear()
    localStorage.clear()
  })

  it('renders sidebar with filter options', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    expect(screen.getByText(/filters/i)).toBeInTheDocument()
    expect(screen.getByText(/price range/i)).toBeInTheDocument()
    expect(screen.getByText(/bedrooms/i)).toBeInTheDocument()
    expect(screen.getByText(/bathrooms/i)).toBeInTheDocument()
  })

  it('renders price range slider', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('renders bedroom filter options', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    expect(screen.getByText('Any')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3+')).toBeInTheDocument()
  })

  it('renders bathroom filter options', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    expect(screen.getByText('Any')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3+')).toBeInTheDocument()
  })

  it('calls onPriceRangeChange when price slider changes', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const priceSlider = screen.getByRole('slider')
    fireEvent.change(priceSlider, { target: { value: '2000' } })

    expect(mockOnPriceRangeChange).toHaveBeenCalledWith(2000)
  })

  it('calls onBedroomChange when bedroom option is selected', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const bedroomOption = screen.getByText('2')
    fireEvent.click(bedroomOption)

    expect(mockOnBedroomChange).toHaveBeenCalledWith('2')
  })

  it('calls onBathroomChange when bathroom option is selected', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const bathroomOption = screen.getByText('2')
    fireEvent.click(bathroomOption)

    expect(mockOnBathroomChange).toHaveBeenCalledWith('2')
  })

  it('handles clear filters button', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const clearButton = screen.getByText(/clear filters/i)
    fireEvent.click(clearButton)

    expect(mockOnFilterChange).toHaveBeenCalled()
  })

  it('displays current filter values', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
        currentPriceRange={1500}
        currentBedrooms="2"
        currentBathrooms="1"
      />
    )

    const priceSlider = screen.getByRole('slider')
    expect(priceSlider).toHaveValue('1500')
  })

  it('handles keyboard navigation', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const priceSlider = screen.getByRole('slider')
    
    // Test keyboard navigation
    fireEvent.keyDown(priceSlider, { key: 'ArrowRight' })
    expect(mockOnPriceRangeChange).toHaveBeenCalled()
  })

  it('handles mobile responsive behavior', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    // Should still render all filter options
    expect(screen.getByText(/filters/i)).toBeInTheDocument()
    expect(screen.getByText(/price range/i)).toBeInTheDocument()
  })

  it('handles filter state persistence', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' }
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
        currentPriceRange={2000}
        currentBedrooms="3"
        currentBathrooms="2"
      />,
      mockUser
    )

    // Verify current values are displayed
    const priceSlider = screen.getByRole('slider')
    expect(priceSlider).toHaveValue('2000')
  })

  it('handles filter validation', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const priceSlider = screen.getByRole('slider')
    
    // Test invalid value handling
    fireEvent.change(priceSlider, { target: { value: '-100' } })
    expect(mockOnPriceRangeChange).toHaveBeenCalledWith(-100)
  })

  it('handles multiple filter changes', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    // Change multiple filters
    const priceSlider = screen.getByRole('slider')
    const bedroomOption = screen.getByText('2')
    const bathroomOption = screen.getByText('1')

    fireEvent.change(priceSlider, { target: { value: '1500' } })
    fireEvent.click(bedroomOption)
    fireEvent.click(bathroomOption)

    expect(mockOnPriceRangeChange).toHaveBeenCalledWith(1500)
    expect(mockOnBedroomChange).toHaveBeenCalledWith('2')
    expect(mockOnBathroomChange).toHaveBeenCalledWith('1')
  })

  it('handles filter reset', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
        currentPriceRange={2000}
        currentBedrooms="2"
        currentBathrooms="1"
      />
    )

    const clearButton = screen.getByText(/clear filters/i)
    fireEvent.click(clearButton)

    // Should call all reset functions
    expect(mockOnFilterChange).toHaveBeenCalled()
  })

  it('handles accessibility features', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const priceSlider = screen.getByRole('slider')
    expect(priceSlider).toHaveAttribute('aria-label')
    expect(priceSlider).toHaveAttribute('aria-valuemin')
    expect(priceSlider).toHaveAttribute('aria-valuemax')
  })

  it('handles filter loading state', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
        loading
      />
    )

    // Should disable interactions when loading
    const priceSlider = screen.getByRole('slider')
    expect(priceSlider).toBeDisabled()
  })

  it('handles custom filter options', () => {
    const customBedroomOptions = [
      { value: 'studio', label: 'Studio' },
      { value: '1', label: '1 Bedroom' },
      { value: '2', label: '2 Bedrooms' }
    ]

    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
        bedroomOptions={customBedroomOptions}
      />
    )

    expect(screen.getByText('Studio')).toBeInTheDocument()
    expect(screen.getByText('1 Bedroom')).toBeInTheDocument()
    expect(screen.getByText('2 Bedrooms')).toBeInTheDocument()
  })

  it('handles price range with custom min/max', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
        minPrice={500}
        maxPrice={5000}
      />
    )

    const priceSlider = screen.getByRole('slider')
    expect(priceSlider).toHaveAttribute('min', '500')
    expect(priceSlider).toHaveAttribute('max', '5000')
  })

  it('handles filter change events', () => {
    renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    const bedroomOption = screen.getByText('1')
    
    // Test click event
    fireEvent.click(bedroomOption)
    expect(mockOnBedroomChange).toHaveBeenCalledWith('1')

    // Test double click (should not cause issues)
    fireEvent.doubleClick(bedroomOption)
    expect(mockOnBedroomChange).toHaveBeenCalledTimes(2)
  })

  it('handles filter state updates', () => {
    const { rerender } = renderWithAuth(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    // Should render without errors
    expect(screen.getByText(/filters/i)).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    render(
      <Sidebar 
        onFilterChange={mockOnFilterChange}
        onPriceRangeChange={mockOnPriceRangeChange}
        onBedroomChange={mockOnBedroomChange}
        onBathroomChange={mockOnBathroomChange}
      />
    )

    // Should render without errors
    expect(screen.getByText(/filters/i)).toBeInTheDocument()
  })

  it('handles missing props gracefully', () => {
    render(<Sidebar />)

    // Should render without crashing
    expect(screen.getByText(/filters/i)).toBeInTheDocument()
  })

  it('handles null props', () => {
    render(
      <Sidebar 
        onFilterChange={null}
        onPriceRangeChange={null}
        onBedroomChange={null}
        onBathroomChange={null}
      />
    )

    // Should render without crashing
    expect(screen.getByText(/filters/i)).toBeInTheDocument()
  })
}) 