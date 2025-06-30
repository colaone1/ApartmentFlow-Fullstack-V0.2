'use client';

export default function Sidebar({ filters = {}, onFilterChange = () => {} }) {
  const { minPrice = 0, maxPrice = 3000, bedrooms = 0, radius = 10 } = filters;

  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: parseInt(value),
    });
  };

  const resetFilters = () => {
    onFilterChange({
      minPrice: 0,
      maxPrice: 3000,
      bedrooms: 0,
      radius: 10,
    });
  };

  return (
    <aside className="w-full md:w-64 p-4 md:p-6 bg-white border-r border-gray-200 md:block overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Filters</h2>

      {/* Min Price */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">
          Min Price (£): {minPrice}
        </label>
        <input
          type="range"
          min="0"
          max="3000"
          step="50"
          value={minPrice}
          onChange={(e) => handleChange('minPrice', e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Max Price */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">
          Max Price (£): {maxPrice}
        </label>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={maxPrice}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Bedrooms */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">
          Bedrooms: {bedrooms}+
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={bedrooms}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Radius */}
      <div className="mb-4 md:mb-6">
        <label className="block font-semibold mb-2 text-sm md:text-base">Radius: {radius} km</label>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={radius}
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
