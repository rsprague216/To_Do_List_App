import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskItem } from './TaskItem';

export const TaskList = ({
  tasks,
  onToggleComplete,
  onToggleImportant,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  onLocalReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      const reordered = arrayMove(tasks, oldIndex, newIndex);

      // Update local state immediately for smooth UX
      if (onLocalReorder) {
        onLocalReorder(reordered);
      }

      // Send reorder to backend
      if (onReorderTasks) {
        onReorderTasks(
          reordered.map((task, index) => ({ id: task.id, position: index }))
        );
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              sortable={true}
              onToggleComplete={onToggleComplete}
              onToggleImportant={onToggleImportant}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
