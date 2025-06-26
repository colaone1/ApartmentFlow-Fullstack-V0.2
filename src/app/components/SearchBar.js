"use client";
import { useState, useEffect, useCallback } from 'react';

export default function SearchBar({ 
  onSearch, 
  onFilterChange, 
  onFocus, 
  onBlur,
  initialSearchValue = '',
  initialFilterValue = '',
  placeholder = 'Search apartments...',
  filterOptions = [
    { value: '', label: 'Sort by' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'date-new', label: 'Date: Newest' },
    { value: 'date-old', label: 'Date: Oldest' }
  ],
  disabled = false,
  loading = false,
  minSearchLength = 0,
  maxSearchLength = 1000,
  caseSensitive = false
}) {
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [filterValue, setFilterValue] = useState(initialFilterValue);

  // Debounced search effect
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (onSearch) {
            const processedValue = caseSensitive ? value : value.toLowerCase();
            onSearch(processedValue);
          }
        }, 300);
      };
    })(),
    [onSearch, caseSensitive]
  );

  useEffect(() => {
    if (searchValue.length >= minSearchLength && searchValue.length <= maxSearchLength) {
      debouncedSearch(searchValue);
    }
  }, [searchValue, debouncedSearch, minSearchLength, maxSearchLength]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Truncate if exceeds max length
    const truncatedValue = value.length > maxSearchLength ? value.substring(0, maxSearchLength) : value;
    setSearchValue(truncatedValue);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterValue(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchValue);
    }
  };

  const handleFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <input
        type="text"
        value={searchValue}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled || loading}
        className="w-80 md:w-100 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
        tabIndex={0}
      />
      
      <select
        value={filterValue}
        onChange={handleFilterChange}
        disabled={disabled || loading}
        className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
        tabIndex={1}
      >
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
