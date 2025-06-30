'use client';

const NotesFilter = ({
  filters = { search: '', category: 'all', priority: 'all', sortBy: 'newest' },
  onFilterChange = () => {},
}) => {
  const { search, category, priority, sortBy } = filters;

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'all',
      priority: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px] mb-2 md:mb-0">
          <label htmlFor="notes-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Notes
          </label>
          <input
            id="notes-search"
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="min-w-[150px]">
          <select
            value={category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="pros">Pros</option>
            <option value="cons">Cons</option>
            <option value="visit">Visit Notes</option>
            <option value="research">Research</option>
            <option value="comparison">Comparison</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="min-w-[150px]">
          <select
            value={priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="min-w-[150px]">
          <select
            value={sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="w-full md:w-auto">
          <button
            onClick={clearFilters}
            className="w-full md:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap mt-2 md:mt-0"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesFilter;
