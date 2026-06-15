import { useState } from "react";
import Column from "./Column";

const COLUMNS = [
  { id: "todo", label: "To Do", icon: "⬡" },
  { id: "in-progress", label: "In Progress", icon: "◈" },
  { id: "done", label: "Done", icon: "◉" },
];

const Board = ({ tasks, onRead, onEdit, onDelete, onUpdate }) => {
  const [dragTask, setDragTask] = useState(null);

  const handleDrop = (status) => {
    if (dragTask && dragTask.status !== status) {
      onUpdate(dragTask._id, { ...dragTask, status });
    }
    setDragTask(null);
  };

  const tasksByStatus = (status) =>
    tasks.filter((t) => t.status === status);

  return (
    <main className="board">
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          column={col}
          tasks={tasksByStatus(col.id)}
          onRead={onRead}
          onEdit={onEdit}
          onDelete={onDelete}
          onDragStart={setDragTask}
          onDragEnd={() => setDragTask(null)}
          onDrop={handleDrop}
        />
      ))}
    </main>
  );
};

export default Board;