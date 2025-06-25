import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NotesFilter from '../NotesFilter'

describe('NotesFilter', () => {
  const mockOnFilterChange = jest.fn()
  const mockOnSortChange = jest.fn()
  const mockOnSearchChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders filter controls', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    expect(screen.getByText(/filter notes/i)).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument()
  })

  it('renders filter dropdown', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders all filter options', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    expect(screen.getByText('All Notes')).toBeInTheDocument()
    expect(screen.getByText('Recent')).toBeInTheDocument()
    expect(screen.getByText('Important')).toBeInTheDocument()
  })

  it('handles missing props gracefully', () => {
    render(<NotesFilter />)

    // Should render without crashing
    expect(screen.getByText(/filter notes/i)).toBeInTheDocument()
  })

  it('handles null props', () => {
    render(
      <NotesFilter 
        onFilterChange={null}
        onSortChange={null}
        onSearchChange={null}
      />
    )

    // Should render without crashing
    expect(screen.getByText(/filter notes/i)).toBeInTheDocument()
  })

  it('calls onSearchChange when search input changes', async () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test search')
    })
  })

  it('calls onFilterChange when filter dropdown changes', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    const filterSelect = screen.getByRole('combobox')
    fireEvent.change(filterSelect, { target: { value: 'recent' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith('recent')
  })

  it('handles empty search input', async () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    fireEvent.change(searchInput, { target: { value: '' } })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('')
    })
  })

  it('handles special characters in search', async () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    fireEvent.change(searchInput, { target: { value: 'test@#$%^&*()' } })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test@#$%^&*()')
    })
  })

  it('handles rapid filter changes', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    const filterSelect = screen.getByRole('combobox')

    fireEvent.change(filterSelect, { target: { value: 'all' } })
    fireEvent.change(filterSelect, { target: { value: 'recent' } })
    fireEvent.change(filterSelect, { target: { value: 'important' } })

    expect(mockOnFilterChange).toHaveBeenCalledTimes(3)
    expect(mockOnFilterChange).toHaveBeenLastCalledWith('important')
  })

  it('handles keyboard navigation', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    const filterSelect = screen.getByRole('combobox')

    searchInput.focus()
    expect(searchInput).toHaveFocus()

    fireEvent.keyDown(searchInput, { key: 'Tab' })
    expect(filterSelect).toHaveFocus()
  })

  it('handles Enter key on search input', async () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test')
    })
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)

    fireEvent.focus(searchInput)
    expect(handleFocus).toHaveBeenCalled()

    fireEvent.blur(searchInput)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('handles search with initial value', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        initialSearchValue="initial search"
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    expect(searchInput).toHaveValue('initial search')
  })

  it('handles filter with initial value', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        initialFilterValue="recent"
      />
    )

    const filterSelect = screen.getByRole('combobox')
    expect(filterSelect).toHaveValue('recent')
  })

  it('handles disabled state', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        disabled
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    const filterSelect = screen.getByRole('combobox')

    expect(searchInput).toBeDisabled()
    expect(filterSelect).toBeDisabled()
  })

  it('handles loading state', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        loading
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)
    const filterSelect = screen.getByRole('combobox')

    expect(searchInput).toBeDisabled()
    expect(filterSelect).toBeDisabled()
  })

  it('handles custom placeholder text', () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        placeholder="Custom placeholder"
      />
    )

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  it('handles custom filter options', () => {
    const customFilters = [
      { value: 'custom1', label: 'Custom Filter 1' },
      { value: 'custom2', label: 'Custom Filter 2' }
    ]

    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        filterOptions={customFilters}
      />
    )

    expect(screen.getByText('Custom Filter 1')).toBeInTheDocument()
    expect(screen.getByText('Custom Filter 2')).toBeInTheDocument()
  })

  it('handles search with minimum character limit', async () => {
    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        minSearchLength={3}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search notes/i)

    fireEvent.change(searchInput, { target: { value: 'ab' } })

    await waitFor(() => {
      expect(mockOnSearchChange).not.toHaveBeenCalled()
    })

    fireEvent.change(searchInput, { target: { value: 'abc' } })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('abc')
    })
  })

  it('handles clear filters functionality', () => {
    const mockOnClear = jest.fn()

    render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
      />
    )

    const clearButton = screen.getByText(/clear/i)
    fireEvent.click(clearButton)

    expect(mockOnClear).toHaveBeenCalled()
  })

  it('handles filter state updates', () => {
    const { rerender } = render(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        currentFilter="all"
      />
    )

    let filterSelect = screen.getByRole('combobox')
    expect(filterSelect).toHaveValue('all')

    rerender(
      <NotesFilter 
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
        onSearchChange={mockOnSearchChange}
        currentFilter="recent"
      />
    )

    filterSelect = screen.getByRole('combobox')
    expect(filterSelect).toHaveValue('recent')
  })
}) 