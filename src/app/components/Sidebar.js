'use client';

export default function Sidebar({ filters = {}, onFilterChange = () => {} }) {
  const { minPrice = null, maxPrice = null, bedrooms = null, radius = null } = filters;

  const handleChange = (field, value) => {
    const numValue = parseInt(value);
    // If the value is 0 and it's not bedrooms, treat it as "no limit"
    const finalValue = numValue === 0 && field !== 'bedrooms' ? null : numValue;

    onFilterChange({
      ...filters,
      [field]: finalValue,
    });
  };

  const resetFilters = () => {
    onFilterChange({
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      radius: null,
    });
  };

  const formatPrice = (price) => {
    if (price === null) return 'No limit';
    if (price >= 5000) return '5000+';
    return price.toString();
  };

  const formatBedrooms = (bedrooms) => {
    if (bedrooms === null) return 'Any';
    return `${bedrooms}+`;
  };

  const formatRadius = (radius) => {
    if (radius === null) return 'No limit';
    return `${radius} km`;
  };

  return (
    <aside className="w-full md:w-64 p-4 md:p-6 bg-white border-r border-gray-200 md:block overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Filters</h2>

      {/* Min Price */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">
          Min Price (£): {formatPrice(minPrice)}
        </label>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={minPrice || 0}
          onChange={(e) => handleChange('minPrice', e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Max Price */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">
          Max Price (£): {formatPrice(maxPrice)}
        </label>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={maxPrice || 0}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Bedrooms */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">
          Bedrooms: {formatBedrooms(bedrooms)}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={bedrooms || 0}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Radius */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">
          Radius: {formatRadius(radius)}
        </label>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={radius || 1}
          onChange={(e) => handleChange('radius', e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Reset Filters */}
      <button
        onClick={resetFilters}
        className="w-full bg-gray-100 text-sm text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
      >
        Reset Filters
      </button>
    </aside>
  );
}
