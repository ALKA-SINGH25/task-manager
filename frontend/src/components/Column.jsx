import Card from "./Card";

const Column = ({ column, tasks, onRead, onEdit, onDelete, onDragStart, onDragEnd, onDrop }) => {
  return (
    <div
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(column.id)}
    >
      <div className="col-header">
        <span className="col-bullet"></span>
        <span className="col-title">{column.label}</span>
        <span className="col-count">{tasks.length}</span>
      </div>

      <div className="col-body">
        {tasks.map((task) => (
          <Card
            key={task._id}
            task={task}
            onRead={onRead}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {tasks.length === 0 && (
          <div className="empty-col">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, marginBottom: '2px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
            <span>No tasks in this column</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;