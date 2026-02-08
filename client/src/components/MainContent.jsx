/**
 * MainContent Component
 * 
 * Main task display area showing tasks for the selected list.
 * 
 * Features:
 * - List title (editable for custom lists)
 * - Add task input (always visible)
 * - Incomplete tasks section with drag-and-drop
 * - Completed tasks section (not draggable)
 * - Placeholder state for empty lists
 * 
 * Props:
 * - selectedList: Current list object {id, name, isDefault}
 * - tasks: Array of tasks for current list
 * - onAddTask: Callback to create new task
 * - onUpdateTask: Callback to update task
 * - onDeleteTask: Callback to delete task
 * - onToggleComplete: Callback to toggle task completion
 * - onToggleImportant: Callback to toggle task important flag
 * - onReorderTasks: Callback to reorder tasks
 * - loading: Boolean for loading state
 */

import { useState, useEffect, useRef } from 'react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * SortableTaskItem - Individual draggable task with swipe support on mobile
 */
const SortableTaskItem = ({
  task,
  isEditing,
  editingText,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onKeyDown,
  onToggleComplete,
  onToggleImportant,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // Swipe gesture state
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);

  // Handle touch start
  const handleTouchStart = (e) => {
    if (isEditing) return;
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!isSwiping || isEditing) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX.current;
    
    // Limit swipe distance
    if (deltaX < -120) {
      setSwipeX(-120); // Max swipe left
    } else if (deltaX > 80) {
      setSwipeX(80); // Max swipe right
    } else {
      setSwipeX(deltaX);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    // Swipe left threshold: show delete
    if (swipeX < -60) {
      setSwipeX(-120);
    }
    // Swipe right threshold: mark complete
    else if (swipeX > 40) {
      onToggleComplete(task.id);
      setSwipeX(0);
    }
    // Reset if not past threshold
    else {
      setSwipeX(0);
    }
  };

  // Reset swipe when task changes
  useEffect(() => {
    setSwipeX(0);
  }, [task.id, isEditing]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : (isSwiping ? 'none' : 'all 0.3s ease'),
    opacity: isDragging ? 0.5 : 1,
  };

  const contentStyle = {
    transform: `translateX(${swipeX}px)`,
    transition: isSwiping ? 'none' : 'transform 0.3s ease',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden border-b border-gray-100 bg-white"
    >
      {/* Swipe actions background - only visible on mobile */}
      <div className="absolute inset-0 flex items-center justify-between sm:hidden">
        {/* Right action (swipe right to complete) */}
        <div className="flex items-center justify-center w-20 h-full bg-green-500">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Left action (swipe left to delete) */}
        <div className="flex items-center justify-center w-32 h-full bg-red-500">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      </div>

      {/* Task content */}
      <div
        style={contentStyle}
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3 hover:bg-gray-50 transition bg-white relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Drag handle */}
      {!isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0 p-1 -ml-1 touch-none"
        >
          <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id);
        }}
        className="flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 rounded border-2 border-gray-400 hover:border-blue-500 transition flex items-center justify-center"
        aria-label={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {!!task.is_completed && (
          <svg className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Task text */}
      {isEditing ? (
        <input
          type="text"
          value={editingText}
          onChange={onEditChange}
          onBlur={onSaveEdit}
          onKeyDown={onKeyDown}
          className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(task);
          }}
          className="flex-1 cursor-pointer text-gray-800"
        >
          {task.title}
        </span>
      )}

      {/* Action buttons */}
      {!isEditing && (
        <div className="flex items-center gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition">
          {/* Important star */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleImportant(task.id);
            }}
            className={`p-2 sm:p-1.5 rounded transition ${
              task.is_important 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            aria-label={task.is_important ? 'Unmark important' : 'Mark important'}
          >
            <svg className="w-5 h-5" fill={task.is_important ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this task?')) {
                onDelete(task.id);
              }
            }}
            className="hidden sm:block p-2 sm:p-1.5 text-red-600 hover:bg-red-50 rounded transition"
            aria-label="Delete task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
      </div>

      {/* Delete button revealed on swipe (mobile only) */}
      {swipeX < -60 && (
        <button
          onClick={() => {
            if (confirm('Delete this task?')) {
              onDelete(task.id);
            }
          }}
          className="absolute right-0 top-0 bottom-0 w-28 bg-red-500 text-white flex items-center justify-center sm:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </li>
  );
};

export const MainContent = ({
  selectedList,
  tasks = [],
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onToggleImportant,
  onReorderTasks,
  loading
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [localTasks, setLocalTasks] = useState(tasks);

  // Update local tasks when props change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      // Require 10px movement before activating to avoid conflicts with scrolling
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag end - reorder tasks
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const incompleteTasks = localTasks.filter(task => !task.completed);
      const completedTasks = localTasks.filter(task => task.completed);

      const oldIndex = incompleteTasks.findIndex((task) => task.id === active.id);
      const newIndex = incompleteTasks.findIndex((task) => task.id === over.id);

      const reorderedTasks = arrayMove(incompleteTasks, oldIndex, newIndex);
      
      // Update local state immediately for smooth UX
      const newTaskList = [...reorderedTasks, ...completedTasks];
      setLocalTasks(newTaskList);

      // Send reorder to backend
      if (onReorderTasks) {
        onReorderTasks(reorderedTasks.map((task, index) => ({
          id: task.id,
          position: index
        })));
      }
    }
  };

  /**
   * Handle adding a new task
   */
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  /**
   * Handle task editing
   */
  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.title);
  };

  const saveTaskEdit = () => {
    if (editingText.trim() && editingTaskId) {
      onUpdateTask(editingTaskId, { title: editingText.trim() });
    }
    setEditingTaskId(null);
    setEditingText('');
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const handleTaskKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveTaskEdit();
    } else if (e.key === 'Escape') {
      cancelTaskEdit();
    }
  };

  /**
   * Separate tasks into incomplete and completed
   */
  const incompleteTasks = localTasks.filter(task => !task.is_completed);
  const completedTasks = localTasks.filter(task => task.is_completed);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading tasks...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* List title */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {selectedList?.name || 'My Day'}
        </h2>
      </div>

      {/* Add task section */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
        <form onSubmit={handleAddTask} className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <button
            type="submit"
            className="p-2.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 flex-shrink-0"
            aria-label="Add task"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>
      </div>

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {localTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg">No tasks yet</p>
            <p className="text-sm">Add a task to get started</p>
          </div>
        ) : (
          <>
            {/* Incomplete tasks with drag-and-drop */}
            {incompleteTasks.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={incompleteTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul>
                    {incompleteTasks.map(task => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        isEditing={editingTaskId === task.id}
                        editingText={editingText}
                        onStartEdit={startEditingTask}
                        onSaveEdit={saveTaskEdit}
                        onCancelEdit={cancelTaskEdit}
                        onEditChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={handleTaskKeyDown}
                        onToggleComplete={onToggleComplete}
                        onToggleImportant={onToggleImportant}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}

            {/* Completed tasks (no drag-and-drop) */}
            {completedTasks.length > 0 && (
              <div className="mt-6">
                <div className="px-4 sm:px-6 py-2 bg-gray-50 border-y border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">
                    Completed ({completedTasks.length})
                  </h3>
                </div>
                <ul>
                  {completedTasks.map(task => (
                    <li
                      key={task.id}
                      className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition opacity-60"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleComplete(task.id)}
                        className="flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 rounded border-2 border-gray-400 hover:border-blue-500 transition flex items-center justify-center"
                        aria-label="Mark incomplete"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Task text */}
                      <span className="flex-1 cursor-pointer line-through text-gray-500">
                        {task.title}
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        {/* Important star */}
                        <button
                          onClick={() => onToggleImportant(task.id)}
                          className={`p-2 sm:p-1.5 rounded transition ${
                            task.is_important 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          aria-label={task.is_important ? 'Unmark important' : 'Mark important'}
                        >
                          <svg className="w-5 h-5" fill={task.is_important ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm('Delete this task?')) {
                              onDeleteTask(task.id);
                            }
                          }}
                          className="hidden sm:block p-2 sm:p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          aria-label="Delete task"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};
