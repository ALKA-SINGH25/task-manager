import Select from "./Select";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const SORT_FIELD_OPTIONS = [
  { value: "created_at", label: "Created Date" },
  { value: "updated_at", label: "Updated Date" },
  { value: "end_date", label: "End Date" },
];

const SORT_ORDER_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const Toolbar = ({
  statusFilter,
  onStatusFilterChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="toolbar">
      <Select
        id="status-filter"
        label="Status"
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={STATUS_OPTIONS}
      />

      <Select
        id="sort-field"
        label="Sort By"
        value={sortField}
        onChange={onSortFieldChange}
        options={SORT_FIELD_OPTIONS}
      />

      <Select
        id="sort-order"
        label="Order"
        value={sortOrder}
        onChange={onSortOrderChange}
        options={SORT_ORDER_OPTIONS}
      />

      <div className="toolbar-group toolbar-view-toggle">
        <button
          className={`view-btn ${viewMode === "board" ? "view-btn-active" : ""}`}
          onClick={() => onViewModeChange("board")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          Board
        </button>
        <button
          className={`view-btn ${viewMode === "list" ? "view-btn-active" : ""}`}
          onClick={() => onViewModeChange("list")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          List
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
