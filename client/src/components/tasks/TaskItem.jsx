import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SWIPE_THRESHOLD } from '../../utils/constants';

export const TaskItem = ({
  task,
  sortable = false,
  onToggleComplete,
  onToggleImportant,
  onUpdate,
  onDelete,
  listName,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !sortable });

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  // Swipe gesture state
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);

  const isCompleted = !!task.is_completed;

  // Handle touch start
  const handleTouchStart = (e) => {
    if (!sortable || isEditing) return;
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!isSwiping || isEditing) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX.current;

    if (deltaX < -120) {
      setSwipeX(-120);
    } else if (deltaX > 80) {
      setSwipeX(80);
    } else {
      setSwipeX(deltaX);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsSwiping(false);

    if (swipeX < -SWIPE_THRESHOLD) {
      setSwipeX(-120);
    } else if (swipeX > 40) {
      onToggleComplete(task.id);
      setSwipeX(0);
    } else {
      setSwipeX(0);
    }
  };

  // Reset swipe on task/edit change
  useEffect(() => {
    setSwipeX(0);
  }, [task.id, isEditing]);

  // Reset editing state when task changes
  useEffect(() => {
    setEditedTitle(task.title);
  }, [task.title]);

  const handleTitleClick = () => {
    if (!isCompleted) {
      setIsEditing(true);
      setEditedTitle(task.title);
    }
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle.trim() !== task.title) {
      onUpdate(task.id, { title: editedTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? transition : isSwiping ? 'none' : 'all 0.3s ease',
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

  const contentStyle = sortable
    ? {
        transform: `translateX(${swipeX}px)`,
        transition: isSwiping ? 'none' : 'transform 0.3s ease',
      }
    : {};

  return (
    <li
      ref={sortable ? setNodeRef : undefined}
      style={style}
      className={`group relative overflow-hidden border-b border-gray-100 ${
        isCompleted ? 'hover:bg-gray-50 transition opacity-60' : 'bg-white'
      }`}
    >
      {/* Swipe action backgrounds - mobile only, sortable only */}
      {sortable && (
        <div className="absolute inset-0 flex items-center justify-between sm:hidden">
          <div className="flex items-center justify-center w-20 h-full bg-green-500">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center justify-center w-32 h-full bg-red-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
      )}

      {/* Task content */}
      <div
        style={contentStyle}
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3 hover:bg-gray-50 transition bg-white relative"
        onTouchStart={sortable ? handleTouchStart : undefined}
        onTouchMove={sortable ? handleTouchMove : undefined}
        onTouchEnd={sortable ? handleTouchEnd : undefined}
      >
        {/* Drag handle - sortable incomplete tasks only */}
        {sortable && !isEditing && (
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
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted && (
            <svg className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Task text */}
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleTitleClick();
            }}
            className={`flex-1 cursor-pointer ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
            }`}
          >
            {task.title}
          </span>
        )}

        {/* List name badge (Important view) */}
        {listName && (
          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
            {listName}
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
      {sortable && swipeX < -SWIPE_THRESHOLD && (
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
