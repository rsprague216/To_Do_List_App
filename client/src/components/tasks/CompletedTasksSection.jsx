import { TaskItem } from './TaskItem';

export const CompletedTasksSection = ({
  tasks,
  onToggleComplete,
  onToggleImportant,
  onDelete,
}) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="px-4 sm:px-6 py-2 bg-gray-50 border-y border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 uppercase">
          Completed ({tasks.length})
        </h3>
      </div>
      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            sortable={false}
            onToggleComplete={onToggleComplete}
            onToggleImportant={onToggleImportant}
            onUpdate={() => {}}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};
