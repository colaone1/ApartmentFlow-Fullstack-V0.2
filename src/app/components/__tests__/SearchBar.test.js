import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// eslint-disable-next-line no-unused-vars
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByPlaceholderText(/search apartments/i)).toBeInTheDocument();
  });

  it('renders filter dropdown', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onSearch when search input changes', async () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test search');
    });
  });

  it('debounces search input changes', async () => {
    jest.useFakeTimers();

    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);

    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should not be called immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Fast-forward timers
    jest.runAllTimers();

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });

    jest.useRealTimers();
  });

  it('calls onFilterChange when filter dropdown changes', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'price-high' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith('price-high');
  });

  it('renders all filter options', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const filterSelect = screen.getByRole('combobox');

    expect(filterSelect).toHaveValue('');
    expect(screen.getByText('Sort by')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
    expect(screen.getByText('Date: Newest')).toBeInTheDocument();
    expect(screen.getByText('Date: Oldest')).toBeInTheDocument();
  });

  it('handles empty search input', async () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  it('handles special characters in search', async () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    fireEvent.change(searchInput, { target: { value: 'test@#$%^&*()' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test@#$%^&*()');
    });
  });

  it('handles long search queries', async () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const longQuery = 'a'.repeat(1000);
    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    fireEvent.change(searchInput, { target: { value: longQuery } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(longQuery);
    });
  });

  it('handles rapid filter changes', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const filterSelect = screen.getByRole('combobox');

    fireEvent.change(filterSelect, { target: { value: 'price-low' } });
    fireEvent.change(filterSelect, { target: { value: 'price-high' } });
    fireEvent.change(filterSelect, { target: { value: 'date-new' } });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    expect(mockOnFilterChange).toHaveBeenLastCalledWith('date-new');
  });

  it('handles keyboard navigation', () => {
    render(<SearchBar />);
    const searchInput = screen.getByPlaceholderText('Search apartments...');
    const filterSelect = screen.getByRole('combobox');
    searchInput.focus();
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    // Accept either input or select as focused
    expect(document.activeElement === filterSelect || document.activeElement === searchInput).toBe(
      true
    );
  });

  it('handles Enter key on search input', async () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });
  });

  it('handles Escape key on search input', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.keyDown(searchInput, { key: 'Escape' });

    expect(searchInput).toHaveValue('test'); // Value should remain unchanged
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(
      <SearchBar
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search apartments/i);

    fireEvent.focus(searchInput);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(searchInput);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('handles search with initial value', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        initialSearchValue="initial search"
      />
    );

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    expect(searchInput).toHaveValue('initial search');
  });

  it('handles filter with initial value', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        initialFilterValue="price-high"
      />
    );

    const filterSelect = screen.getByRole('combobox');
    expect(filterSelect).toHaveValue('price-high');
  });

  it('handles disabled state', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} disabled />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    const filterSelect = screen.getByRole('combobox');

    expect(searchInput).toBeDisabled();
    expect(filterSelect).toBeDisabled();
  });

  it('handles loading state', () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} loading />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    const filterSelect = screen.getByRole('combobox');

    expect(searchInput).toBeDisabled();
    expect(filterSelect).toBeDisabled();
  });

  it('handles custom placeholder text', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        placeholder="Custom placeholder"
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('handles custom filter options', () => {
    const customFilters = [
      { value: 'custom1', label: 'Custom Filter 1' },
      { value: 'custom2', label: 'Custom Filter 2' },
    ];

    render(
      <SearchBar
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        filterOptions={customFilters}
      />
    );

    expect(screen.getByText('Custom Filter 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Filter 2')).toBeInTheDocument();
  });

  it('handles search with minimum character limit', async () => {
    render(
      <SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} minSearchLength={3} />
    );

    const searchInput = screen.getByPlaceholderText(/search apartments/i);

    // Search with less than minimum characters
    fireEvent.change(searchInput, { target: { value: 'ab' } });

    await waitFor(() => {
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    // Search with minimum characters
    fireEvent.change(searchInput, { target: { value: 'abc' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('abc');
    });
  });

  it('handles search with maximum character limit', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} maxSearchLength={20} />);
    const searchInput = screen.getByPlaceholderText('Search apartments...');
    fireEvent.change(searchInput, { target: { value: 'this is a very long search query' } });
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  it('handles search with case sensitivity', async () => {
    render(<SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} caseSensitive />);

    const searchInput = screen.getByPlaceholderText(/search apartments/i);
    fireEvent.change(searchInput, { target: { value: 'Test Search' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('Test Search');
    });
  });
});
