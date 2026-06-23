import { CATEGORIES } from "../utils/expenseHelpers";

const ExpenseFilters = ({ filters, onFilterChange }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap', gap: '15px' }}>
      <div className="search-wrap" style={{ flex: '1 1 200px' }}>
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', minWidth: '18px' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search title or desc..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>

      <select
        className="filter-select"
        value={filters.category}
        onChange={(e) => handleChange("category", e.target.value)}
        style={{ flex: '0 1 auto' }}
      >
        <option value="all">All Categories</option>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Month:</span>
        <select
          className="filter-select"
          value={filters.month}
          onChange={(e) => handleChange("month", e.target.value)}
        >
          <option value="">All</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Year:</span>
        <select
          className="filter-select"
          value={filters.year}
          onChange={(e) => handleChange("year", e.target.value)}
        >
          <option value="">All</option>
          {[2024, 2025, 2026, 2027, 2028].map(y => (
             <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sort:</span>
        <select
            className="filter-select"
            value={filters.sortField}
            onChange={(e) => handleChange("sortField", e.target.value)}
        >
            <option value="expense_date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
            <option value="created_at">Date Added</option>
        </select>
        <button 
            className="btn-icon" 
            onClick={() => handleChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
        >
            {filters.sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilters;
