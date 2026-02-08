# TO-DO LIST APP - COMPLETE DESIGN DOCUMENT

---

## TABLE OF CONTENTS

1. [Project Description and Overview](#1-project-description-and-overview)
2. [User Flows](#2-user-flows)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Wireframes and UI Specification](#5-wireframes-and-ui-specification)
6. [React Component Structure](#6-react-component-structure)
7. [Technical Stack](#7-technical-stack)

---

## 1. PROJECT DESCRIPTION AND OVERVIEW

### 1.1 Project Summary

A minimal, responsive web-based to-do list application that allows users to organize tasks across multiple lists while highlighting important items. The app emphasizes simplicity and clean design, focusing on core task management without feature bloat.

### 1.2 Core Features

**User Management:**
- Username and password authentication
- Secure session management with JWT tokens
- Personal user accounts with isolated data

**List Management:**
- Default "My Day" list for quick task capture
- "Important Tasks" aggregator view showing flagged tasks across all lists
- User-created custom lists for organization
- Inline list renaming and deletion

**Task Management:**
- Simple task creation with text-only entries
- Mark tasks as complete/incomplete
- Flag tasks as important (appears in Important Tasks view)
- Inline task editing
- Task deletion
- Drag-and-drop reordering within lists

**Responsive Design:**
- Desktop: Full sidebar with main content area
- Tablet: Narrower sidebar with optimized spacing
- Mobile: Hamburger menu with overlay sidebar, swipe gestures for task actions

### 1.3 Design Philosophy

**Minimal and Focused:**
- No feature bloat - just essential task management
- Clean, uncluttered interface
- Fast, responsive interactions

**User-Friendly:**
- Intuitive interactions (click to edit, drag to reorder)
- Visual feedback for all actions
- Mobile-optimized with touch-friendly gestures

**Professional Quality:**
- Modern tech stack
- Proper authentication and security
- Responsive across all devices
- Clean, maintainable code structure

### 1.4 Out of Scope (Future Enhancements)

The following features are intentionally excluded from the initial version but could be added later:
- Due dates and reminders
- Subtasks or task details
- Task categories/tags
- Collaborative lists or sharing
- File attachments
- Search functionality
- Task sorting options
- Recurring tasks
- Email notifications
- Calendar integration
- Dark mode
- Export/import functionality

### 1.5 Target Users

**Primary User:**
- Individual looking for simple, personal task management
- Values clean design over feature complexity
- Uses multiple devices (desktop, tablet, mobile)
- Wants basic organization without overwhelming options

**Use Cases:**
- Daily task tracking ("My Day" list)
- Organizing tasks by context (Work, Personal, Shopping)
- Highlighting urgent/important items across all lists
- Quick task capture and completion

### 1.6 Success Criteria

The project is successful if it delivers:
1. Secure user authentication with persistent sessions
2. Reliable task and list CRUD operations
3. Smooth, responsive UI across desktop, tablet, and mobile
4. Intuitive drag-and-drop reordering
5. Clean, professional visual design
6. Fast performance with minimal loading states

---

## 2. USER FLOWS

### 2.1 Authentication Flows

#### 2.1.1 New User Signup Flow

**Flow:**
1. User arrives at app (URL: `/` or `/login`)
2. App checks for JWT token in localStorage
   - Token exists → redirect to `/app`
   - No token → show AuthPage (login view)
3. User clicks "Sign up" link
4. AuthPage switches to SignUpForm component
5. User enters username, password, confirm password
6. User clicks "Create Account" button
7. **Client-side validation:**
   - Username: Required, minimum 3 characters
   - Password: Required, minimum 6 characters
   - Confirm Password: Must match password
8. If validation fails:
   - Invalid fields highlighted with red border
   - Error messages display below fields
   - Form remains populated for correction
   - User fixes errors and resubmits
9. If validation passes:
   - API call: `POST /api/auth/register`
   - Request body: `{ username, password }`
10. **Server-side processing:**
    - Check if username already exists
    - If exists → return error: "Username already exists"
    - If available → hash password, create user record
    - Create default "My Day" list for user
    - Generate JWT token
    - Return: `{ user: { id, username }, token }`
11. **Client receives response:**
    - Success: Store token in localStorage
    - Success: Set user in AuthContext
    - Success: Redirect to `/app`
    - Error: Display error message below form
12. User lands on main app with empty "My Day" list

**Edge Cases:**
- Network error during signup → Display: "Unable to create account. Please try again."
- Username already taken → Display: "Username already exists" under username field
- Server error → Display: "Something went wrong. Please try again later."

---

#### 2.1.2 Returning User Login Flow

**Flow:**
1. User arrives at app (URL: `/` or `/login`)
2. App checks for JWT token in localStorage
   - Token exists → Call `GET /api/user/me` to verify
     - Valid token → redirect to `/app`
     - Invalid/expired token → remove token, show login
   - No token → show AuthPage (login view)
3. User enters username and password
4. User clicks "Login" button
5. **Client-side validation:**
   - Username: Required
   - Password: Required
6. If validation fails → show inline error messages
7. If validation passes:
   - API call: `POST /api/auth/login`
   - Request body: `{ username, password }`
8. **Server-side processing:**
   - Look up user by username
   - If not found → return error: "Invalid username or password"
   - If found → compare password hash
   - If incorrect → return error: "Invalid username or password"
   - If correct → generate JWT token
   - Return: `{ user: { id, username }, token }`
9. **Client receives response:**
   - Success: Store token in localStorage
   - Success: Set user in AuthContext
   - Success: Redirect to `/app`
   - Error: Display: "Invalid username or password"
10. User lands on main app with their existing lists and tasks

**Edge Cases:**
- Wrong password → "Invalid username or password" (don't specify which is wrong for security)
- Network error → "Unable to connect. Please check your connection."
- Token expired during session → Next API call fails with 401, redirect to login

---

#### 2.1.3 App Load with Existing Session

**Flow:**
1. User has previously logged in (token in localStorage)
2. User navigates to app or refreshes page
3. App.jsx loads, AuthContext initializes
4. AuthContext checks localStorage for token
   - Token found → Call `GET /api/user/me`
5. **API validates token:**
   - Valid → return user info `{ id, username }`
   - Invalid/expired → return 401 error
6. **If token valid:**
   - Set user in AuthContext
   - Allow access to `/app` route
   - Fetch user's lists
   - Load last viewed list (or default to "My Day")
7. **If token invalid:**
   - Remove token from localStorage
   - Clear user from AuthContext
   - Redirect to `/login`

**Edge Cases:**
- Token expired while app idle → Next API call returns 401, trigger logout
- Network error during validation → Show loading state, retry, or fallback to login

---

#### 2.1.4 Logout Flow

**Flow:**
1. User clicks logout button in Header
2. **Client-side:**
   - Remove JWT token from localStorage
   - Clear user from AuthContext
   - Clear any cached list/task data
3. Redirect to `/login`
4. User sees login screen

**No server call needed** - JWT logout is client-side only (token just stops being sent).

---

### 2.2 List Management Flows

#### 2.2.1 Creating a New List

**Flow:**
1. User is on main app page (`/app`)
2. User clicks "+ New List" button in sidebar
3. **Client-side:**
   - API call: `POST /api/lists`
   - Request body: `{ name: "New List" }` (default name)
4. **Server-side:**
   - Create list record with user_id, name, is_default=false
   - Return list object: `{ id, name, is_default, created_at }`
5. **Client receives response:**
   - Add new list to lists array in state
   - New list appears in sidebar
   - List name is immediately in edit mode (input field focused)
   - User can type custom name
6. User types desired name (e.g., "Groceries")
7. User presses Enter or clicks outside input
8. **Client-side:**
   - API call: `PUT /api/lists/:listId`
   - Request body: `{ name: "Groceries" }`
9. **Server-side:**
   - Update list name in database
   - Return updated list object
10. **Client receives response:**
    - Update list name in state
    - Exit edit mode
    - List displays with new name in sidebar

**Edge Cases:**
- Empty name → Default to "New List" or show validation error
- Network error during creation → Show error, remove temp list from UI
- User creates list but doesn't rename → Keeps "New List" name

---

#### 2.2.2 Renaming a List

**Desktop/Tablet Flow:**
1. User hovers over list in sidebar
2. Edit icon (pencil) appears
3. User clicks edit icon
4. List name becomes editable input field
5. User edits name
6. User presses Enter or clicks outside
7. API call: `PUT /api/lists/:listId` with new name
8. Server updates, returns updated list
9. List name updates in sidebar
10. If this list is currently selected, title in MainContent also updates

**Mobile Flow:**
1. User long-presses list in sidebar
2. Context menu appears with "Rename" option
3. User taps "Rename"
4. List name becomes editable
5. Mobile keyboard opens
6. User edits name, presses Enter
7. API call: `PUT /api/lists/:listId`
8. Name updates, keyboard closes

**Edge Cases:**
- Empty name → Show validation error or revert to previous name
- Network error → Revert to previous name, show error
- User is viewing the renamed list → Update both sidebar and main area title

---

#### 2.2.3 Deleting a List

**Desktop/Tablet Flow:**
1. User hovers over list in sidebar
2. Delete icon (trash) appears
3. User clicks delete icon
4. Optional: Confirmation dialog appears: "Delete this list and all its tasks?"
5. User confirms deletion
6. API call: `DELETE /api/lists/:listId`
7. **Server-side:**
   - Delete list record (CASCADE deletes all tasks in list)
   - Return success message
8. **Client receives response:**
   - Remove list from lists array
   - List disappears from sidebar
9. **If deleted list was currently selected:**
   - Switch to "My Day" list
   - Load tasks for "My Day"
   - Update MainContent to show "My Day"

**Mobile Flow:**
1. User long-presses list (or swipes left)
2. Delete option appears
3. User taps delete
4. Optional: Confirmation dialog
5. User confirms
6. API call, list deleted, UI updates

**Edge Cases:**
- "My Day" and "Important Tasks" cannot be deleted (no delete icon shown)
- Network error during deletion → Show error, keep list visible
- User deletes list they're currently viewing → Auto-switch to "My Day"
- List has many tasks → All cascade-deleted (confirmation important here)

---

#### 2.2.4 Switching Between Lists

**Desktop/Tablet Flow:**
1. User clicks on a list name in sidebar
2. **Client-side:**
   - Update selectedListId in AppPage state
   - Highlight clicked list in sidebar
   - MainContent receives new selectedListId prop
3. **MainContent useEffect triggers:**
   - API call: `GET /api/lists/:listId/tasks`
4. **Server returns:**
   - Array of tasks for that list
5. **Client receives response:**
   - Clear previous tasks from state
   - Set new tasks in state
   - TaskList re-renders with new tasks
   - Update list title in MainContent

**Mobile Flow:**
1. User taps hamburger icon in header
2. Sidebar slides in as overlay
3. User taps list name
4. **Sidebar automatically closes** (smooth animation)
5. List selection updates (same as desktop from here)
6. Tasks load and display

**Viewing Important Tasks:**
1. User clicks/taps "Important Tasks" in sidebar
2. selectedListId set to "important" (special identifier)
3. API call: `GET /api/tasks/important`
4. Server returns all tasks where is_important=true across all lists
5. Tasks display with list name labels (e.g., "Work", "Personal")
6. All task operations available (complete, edit, delete, unmark important)

**Edge Cases:**
- Network error loading tasks → Show error message in MainContent
- List has no tasks → Show empty state: "No tasks yet! Add one above."
- Switching lists while editing a task → Save or discard changes first

---

### 2.3 Task Management Flows

#### 2.3.1 Creating a Task

**Flow:**
1. User is viewing a list (e.g., "My Day")
2. User clicks/taps in "Add a task..." input field
3. User types task title (e.g., "Buy milk")
4. User presses Enter OR clicks/taps "+" button
5. **Client-side validation:**
   - Task title is required (not empty)
   - If empty → don't submit, keep focus in input
6. If valid:
   - API call: `POST /api/lists/:listId/tasks`
   - Request body: `{ title: "Buy milk" }`
7. **Server-side:**
   - Create task record with:
     - list_id (current list)
     - user_id
     - title: "Buy milk"
     - is_important: false
     - is_completed: false
     - position: (max position in list + 1)
   - Return task object
8. **Client receives response:**
   - Add task to tasks array in state
   - Task appears at bottom of incomplete tasks section
   - Input field clears
   - Input remains focused for quick additional entry

**Edge Cases:**
- Empty title → Don't submit, show subtle shake animation or keep focus
- Network error → Show error, don't add task to UI
- Very long title → Truncate with ellipsis in display, but store full text

---

#### 2.3.2 Completing a Task

**Flow:**
1. User clicks/taps checkbox next to incomplete task
2. **Optimistic UI update:**
   - Checkbox immediately fills/checks
   - Task text grays out
   - Task animates to bottom of list (completed section)
3. **Client-side:**
   - API call: `PATCH /api/tasks/:taskId`
   - Request body: `{ is_completed: true }`
4. **Server-side:**
   - Update task: is_completed = true, completed_at = current timestamp
   - Return updated task object
5. **Client receives response:**
   - Confirm update in state
   - Task remains in completed section

**If already in Important Tasks view:**
- Task also shows as completed there
- Stays in Important Tasks list (still flagged important)

**Edge Cases:**
- Network error → Revert UI change (uncheck, move back to incomplete)
- Multiple rapid clicks → Debounce or disable during API call

---

#### 2.3.3 Uncompleting a Task

**Flow:**
1. User clicks/taps checked checkbox in completed section
2. **Optimistic UI update:**
   - Checkbox unchecks
   - Task text returns to normal color
   - Task animates back to incomplete section
   - Positioned at bottom of incomplete tasks
3. **Client-side:**
   - API call: `PATCH /api/tasks/:taskId`
   - Request body: `{ is_completed: false }`
4. **Server-side:**
   - Update task: is_completed = false, completed_at = NULL
   - Return updated task object
5. **Client receives response:**
   - Confirm update in state

**Edge Cases:**
- Network error → Revert UI (move back to completed, re-check)

---

#### 2.3.4 Editing a Task

**Flow:**
1. User clicks/taps on task text
2. Task text becomes editable input field
3. Text is highlighted/selected for easy editing
4. User edits text (e.g., "Buy milk" → "Buy almond milk")
5. User presses Enter OR clicks/taps outside input
6. **Client-side:**
   - If text unchanged → just exit edit mode
   - If changed:
     - API call: `PATCH /api/tasks/:taskId`
     - Request body: `{ title: "Buy almond milk" }`
7. **Server-side:**
   - Update task title in database
   - Return updated task object
8. **Client receives response:**
   - Update task text in state
   - Exit edit mode
   - Task displays with new text

**Edge Cases:**
- Empty text → Show validation error or revert to previous text
- User presses Escape → Cancel edit, revert to original text
- Network error → Revert to original text, show error
- Very long text → Allow but truncate display with ellipsis

---

#### 2.3.5 Marking Task as Important

**Desktop/Tablet Flow:**
1. User hovers over task
2. Star icon appears (outline if not important, filled if already important)
3. User clicks star icon
4. **Client-side:**
   - API call: `PATCH /api/tasks/:taskId`
   - Request body: `{ is_important: true }`
5. **Server-side:**
   - Update task: is_important = true
   - Return updated task
6. **Client receives response:**
   - Update task in state
   - Star icon fills
   - Task now appears in "Important Tasks" view

**Mobile Flow:**
1. User swipes right on task (30-40% of width)
2. Star icon reveals on left side
3. User taps star icon
4. API call: `PATCH /api/tasks/:taskId` with is_important=true
5. Star fills, task marked important
6. Swipe action hides (task returns to normal position)
7. Task appears in "Important Tasks" view

**If user is currently in Important Tasks view:**
- Task was already there, stays there
- Star icon just fills to show it's marked

**Edge Cases:**
- Network error → Revert star icon state
- User rapidly toggles → Debounce API calls

---

#### 2.3.6 Unmarking Task as Important

**Same flow as marking, but:**
- Star icon already filled
- User clicks/taps filled star
- API call: `PATCH /api/tasks/:taskId` with is_important=false
- Star icon changes to outline
- **Task removed from "Important Tasks" view**
- Still visible in original list

**Edge Cases:**
- User is viewing Important Tasks and unmarks a task → Task disappears from view
- Network error → Revert star state, keep in Important Tasks view

---

#### 2.3.7 Deleting a Task

**Desktop/Tablet Flow:**
1. User hovers over task
2. Delete icon (trash) appears
3. User clicks delete icon
4. Optional: Confirmation dialog (or just delete immediately for simplicity)
5. **Client-side:**
   - Optimistic UI: Task fades out and removes from list
   - API call: `DELETE /api/tasks/:taskId`
6. **Server-side:**
   - Delete task record from database
   - Return success message
7. **Client receives response:**
   - Confirm removal from state
   - Task is gone

**Mobile Flow:**
1. User swipes left on task (30-40% of width)
2. Delete icon reveals on right side
3. User taps delete icon
4. Task deleted (same API flow as desktop)
5. Task fades out and removes

**If task was important:**
- Also removed from "Important Tasks" view

**Edge Cases:**
- Network error → Re-add task to UI, show error message
- Accidental deletion → Could implement undo toast (but we're skipping toasts)
- User deletes task they're currently editing → Close edit mode, delete task

---

#### 2.3.8 Reordering Tasks (Desktop/Tablet)

**Flow:**
1. User hovers over a task
2. Drag handle appears (≡ icon on left)
3. User clicks and holds drag handle
4. Task visually "lifts" (slight shadow, elevation)
5. User drags task up or down
6. Other tasks shift to show drop position
7. User releases mouse
8. Task drops into new position
9. **Client-side:**
   - Optimistically update task positions in state
   - API call: `PATCH /api/lists/:listId/tasks/reorder`
   - Request body: `{ taskIds: [3, 1, 4, 2, 5] }` (array of IDs in new order)
10. **Server-side:**
    - Update position values for affected tasks
    - Return success
11. **Client receives response:**
    - Confirm new order in state

**Using dnd-kit library for smooth drag-and-drop experience.**

**Edge Cases:**
- Network error → Revert to original order
- User drags task while another API call in progress → Queue or prevent
- Completed tasks → Cannot be reordered (they're always at bottom)

---

#### 2.3.9 Reordering Tasks (Mobile)

**Flow:**
1. User taps and holds task for ~500ms
2. **Haptic feedback** (if device supports)
3. Task visually lifts (larger, shadow)
4. Task follows user's finger as they drag
5. Other tasks shift to show drop position
6. User lifts finger
7. Task drops into new position
8. Same API call as desktop: `PATCH /api/lists/:listId/tasks/reorder`

**Implementation:**
- Tap-and-hold detection with touch events
- Must distinguish from swipe gestures
- If movement is vertical → reorder mode
- If movement is horizontal → swipe gesture mode

**Edge Cases:**
- User swipes while holding → Determine intent (vertical=reorder, horizontal=swipe)
- Network error → Revert to original order

---

### 2.4 Mobile-Specific Flows

#### 2.4.1 Opening Sidebar (Mobile)

**Flow:**
1. User is on main app view (tasks visible)
2. User taps hamburger icon (☰) in top-left of header
3. **Animation:**
   - Dark semi-transparent overlay fades in behind sidebar
   - Sidebar slides in from left (smooth 300ms animation)
4. Sidebar is now visible with full list navigation
5. Main content slightly darkened, not interactive

---

#### 2.4.2 Closing Sidebar (Mobile)

**Method 1: Tap outside**
1. User taps on darkened background area (not on sidebar)
2. Sidebar slides out to left
3. Overlay fades out
4. Main content returns to normal

**Method 2: Select a list**
1. User taps a list in sidebar
2. List selection updates
3. Sidebar automatically slides out
4. Overlay fades out
5. Main content shows selected list's tasks

**Method 3: Tap hamburger again**
1. User taps hamburger icon (now shows X or back arrow)
2. Sidebar slides out
3. Overlay fades out

---

#### 2.4.3 Swipe Gesture on Task (Mobile)

**Swipe Right (Mark Important):**
1. User touches task and swipes right
2. As finger moves, star icon reveals on left (follows finger)
3. If swipe distance < 30% of width → snaps back when released
4. If swipe distance ≥ 30% of width → star stays revealed
5. User taps star icon → task marked important
6. Swipe action hides, task returns to normal

**Swipe Left (Delete):**
1. User touches task and swipes left
2. Delete icon reveals on right (follows finger)
3. If swipe distance < 30% of width → snaps back
4. If swipe distance ≥ 30% of width → delete icon stays revealed
5. User taps delete → task deleted
6. Task fades out and removes

**Closing Revealed Actions:**
- Tap anywhere else on screen
- Swipe in opposite direction
- Scroll the task list
- Select another list

---

### 2.5 Error and Edge Case Flows

#### 2.5.1 Network Error During Action

**Scenario:** User creates task, but network is down

**Flow:**
1. User submits new task
2. API call fails (network timeout or offline)
3. **Client-side:**
   - Show error message: "Unable to connect. Please check your connection."
   - Don't add task to UI (or remove if optimistically added)
   - Keep input text so user can retry
4. User fixes connection and resubmits
5. Task created successfully

---

#### 2.5.2 Token Expiration During Session

**Scenario:** User is actively using app, JWT expires

**Flow:**
1. User performs action (e.g., create task)
2. API call made with expired token
3. **Server returns:** 401 Unauthorized
4. **Axios interceptor catches 401:**
   - Remove token from localStorage
   - Clear user from AuthContext
   - Redirect to `/login`
5. User sees login page with message: "Your session has expired. Please log in again."
6. User logs in again
7. Returns to app (data reloads)

---

#### 2.5.3 Empty States

**No Lists (shouldn't happen - "My Day" is default):**
- If somehow user has no lists → Show "Create your first list" prompt

**No Tasks in List:**
- Show empty state message: "No tasks yet! Add one above."
- Add task input still visible and functional

**No Important Tasks:**
- When viewing Important Tasks with none flagged
- Show: "No important tasks. Mark tasks with ⭐ to see them here."

---

#### 2.5.4 Rapid/Concurrent Actions

**Scenario:** User rapidly clicks same action multiple times

**Flow:**
1. User clicks "Create Task" button repeatedly
2. **Client-side protection:**
   - Disable button during API call (isLoading state)
   - Or debounce button clicks
3. Only one task created per actual submission

**Scenario:** User edits task while delete is processing

**Flow:**
1. User starts editing task text
2. User (or another device) deletes the task
3. Task disappears from UI
4. Edit mode closes automatically
5. If user had unsaved changes → Lost (acceptable for minimal app)

---

#### 2.5.5 Page Refresh During Action

**Scenario:** User creates task, refreshes before API completes

**Flow:**
1. User submits new task
2. API call in progress
3. User refreshes page (or closes tab)
4. **API call might still complete on server** (task created)
5. On page reload:
   - Token validated
   - User's lists loaded
   - Tasks fetched (includes newly created task)
6. Task appears in list

**No data loss** because server handles the creation, even if client refreshes.

---

### 2.6 Cross-Device Scenarios

#### 2.6.1 Same User, Multiple Devices

**Scenario:** User logs in on desktop and mobile simultaneously

**Flow:**
1. User logs in on desktop browser → viewing "My Day" list
2. User logs in on mobile → also viewing "My Day" list
3. User creates task on desktop
4. **Desktop:** Task appears immediately
5. **Mobile:** Task doesn't appear (no real-time sync)
6. User refreshes mobile app → Task now appears

**Current design:** No real-time sync, refresh required to see changes from other devices.

**Future enhancement:** WebSockets for real-time updates across devices.

---

## 3. DATABASE SCHEMA

### 3.1 Overview

Three main tables: `users`, `lists`, and `tasks` with one-to-many relationships.

### 3.2 Tables

#### 3.2.1 Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, auto-incrementing
- `username`: Unique, not null
- `password_hash`: Hashed password (using bcrypt), not null
- `created_at`: Timestamp of account creation

**Indexes:**
- Primary key on `id`
- Unique index on `username` (for login lookups)

---

#### 3.2.2 Lists Table

```sql
CREATE TABLE lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key, auto-incrementing
- `user_id`: Foreign key to users table, not null
- `name`: List name (e.g., "My Day", "Work"), not null
- `is_default`: Boolean flag for default "My Day" list
- `created_at`: Timestamp of list creation

**Foreign Keys:**
- `user_id` references `users(id)` with ON DELETE CASCADE
  - When user is deleted, all their lists are deleted

**Indexes:**
- Primary key on `id`
- Index on `user_id` (for querying user's lists)

**Notes:**
- Each user should have exactly one list with is_default=true ("My Day")
- Created automatically during user registration

---

#### 3.2.3 Tasks Table

```sql
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    list_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    position INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Primary key, auto-incrementing
- `list_id`: Foreign key to lists table, not null
- `user_id`: Foreign key to users table, not null (redundant but useful for queries)
- `title`: Task text content, not null
- `is_important`: Boolean flag for important tasks
- `is_completed`: Boolean flag for completion status
- `position`: Integer for ordering within list, not null
- `created_at`: Timestamp of task creation
- `completed_at`: Timestamp when completed (NULL if not completed)

**Foreign Keys:**
- `list_id` references `lists(id)` with ON DELETE CASCADE
  - When list is deleted, all its tasks are deleted
- `user_id` references `users(id)` with ON DELETE CASCADE
  - When user is deleted, all their tasks are deleted

**Indexes:**
- Primary key on `id`
- Index on `list_id` (for querying tasks in a list)
- Index on `user_id` (for querying all user's tasks)
- Composite index on `(list_id, position)` (for ordering tasks within a list)

**Notes:**
- `user_id` is technically redundant (can get via list_id → lists → user_id)
- Included for simpler/faster queries like "get all important tasks for user"
- `position` determines display order within a list (1, 2, 3, ...)
- When new task created, position = (max position in list) + 1

---

### 3.3 Relationships

**One-to-Many Relationships:**
1. **User → Lists**: One user has many lists
   - FK: `lists.user_id` → `users.id`
   - Cascade: Delete user → delete all their lists

2. **List → Tasks**: One list has many tasks
   - FK: `tasks.list_id` → `lists.id`
   - Cascade: Delete list → delete all its tasks

**Cascade Deletion Flow:**
- Delete user → All lists deleted → All tasks in those lists deleted
- Delete list → All tasks in that list deleted
- Delete task → Just that task deleted

---

### 3.4 Sample Data

```sql
-- User
INSERT INTO users (username, password_hash) 
VALUES ('john_doe', '$2b$10$...');  -- hashed password

-- Lists for john_doe (user_id=1)
INSERT INTO lists (user_id, name, is_default) 
VALUES (1, 'My Day', TRUE);

INSERT INTO lists (user_id, name, is_default) 
VALUES (1, 'Work', FALSE);

INSERT INTO lists (user_id, name, is_default) 
VALUES (1, 'Personal', FALSE);

-- Tasks in "My Day" list (list_id=1)
INSERT INTO tasks (list_id, user_id, title, is_important, is_completed, position) 
VALUES (1, 1, 'Review pull requests', TRUE, FALSE, 1);

INSERT INTO tasks (list_id, user_id, title, is_important, is_completed, position) 
VALUES (1, 1, 'Buy groceries', FALSE, FALSE, 2);

INSERT INTO tasks (list_id, user_id, title, is_important, is_completed, position, completed_at) 
VALUES (1, 1, 'Call mom', FALSE, TRUE, 3, '2025-01-15 14:30:00');
```

---

## 4. API ENDPOINTS

### 4.1 Authentication Endpoints

#### POST /api/auth/register
**Purpose:** Create new user account

**Request:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (Success - 201):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error - 400):**
```json
{
  "error": "Username already exists"
}
```

**Server Actions:**
1. Validate username and password
2. Check if username already exists
3. Hash password with bcrypt
4. Create user record
5. Create default "My Day" list for user
6. Generate JWT token
7. Return user info and token

---

#### POST /api/auth/login
**Purpose:** Login and get JWT token

**Request:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid username or password"
}
```

**Server Actions:**
1. Look up user by username
2. Compare password hash
3. Generate JWT token (expires in 24h or configurable)
4. Return user info and token

---

#### GET /api/user/me
**Purpose:** Get current logged-in user info (validate token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "created_at": "2025-01-01T10:00:00Z"
}
```

**Response (Error - 401):**
```json
{
  "error": "Unauthorized"
}
```

**Server Actions:**
1. Verify JWT token from Authorization header
2. Extract user_id from token
3. Look up user in database
4. Return user info

---

### 4.2 List Endpoints

#### GET /api/lists
**Purpose:** Get all lists for logged-in user

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "name": "My Day",
    "is_default": true,
    "created_at": "2025-01-01T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Work",
    "is_default": false,
    "created_at": "2025-01-05T14:30:00Z"
  },
  {
    "id": 3,
    "name": "Personal",
    "is_default": false,
    "created_at": "2025-01-10T09:15:00Z"
  }
]
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Query: SELECT * FROM lists WHERE user_id = ? ORDER BY created_at
3. Return array of lists

---

#### POST /api/lists
**Purpose:** Create a new list

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Groceries"
}
```

**Response (Success - 201):**
```json
{
  "id": 4,
  "name": "Groceries",
  "is_default": false,
  "created_at": "2025-01-15T11:20:00Z"
}
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Validate list name (not empty)
3. Insert new list: INSERT INTO lists (user_id, name) VALUES (?, ?)
4. Return created list object

---

#### PUT /api/lists/:list_id
**Purpose:** Rename a list

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Shopping List"
}
```

**Response (Success - 200):**
```json
{
  "id": 4,
  "name": "Shopping List",
  "is_default": false,
  "created_at": "2025-01-15T11:20:00Z"
}
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Verify list belongs to user: SELECT * FROM lists WHERE id = ? AND user_id = ?
3. Update list name: UPDATE lists SET name = ? WHERE id = ?
4. Return updated list

---

#### DELETE /api/lists/:list_id
**Purpose:** Delete a list (and all its tasks via CASCADE)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "List deleted"
}
```

**Response (Error - 403):**
```json
{
  "error": "Cannot delete default list"
}
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Verify list belongs to user
3. Check is_default flag (prevent deletion of "My Day")
4. Delete list: DELETE FROM lists WHERE id = ?
5. Tasks cascade-delete automatically
6. Return success message

---

### 4.3 Task Endpoints

#### GET /api/lists/:list_id/tasks
**Purpose:** Get all tasks for a specific list

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "list_id": 1,
    "title": "Review pull requests",
    "is_important": true,
    "is_completed": false,
    "position": 1,
    "created_at": "2025-01-15T09:00:00Z",
    "completed_at": null
  },
  {
    "id": 2,
    "list_id": 1,
    "title": "Buy groceries",
    "is_important": false,
    "is_completed": false,
    "position": 2,
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": null
  },
  {
    "id": 3,
    "list_id": 1,
    "title": "Call mom",
    "is_important": false,
    "is_completed": true,
    "position": 3,
    "created_at": "2025-01-14T14:00:00Z",
    "completed_at": "2025-01-15T14:30:00Z"
  }
]
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Verify list belongs to user
3. Query: SELECT * FROM tasks WHERE list_id = ? ORDER BY is_completed ASC, position ASC
4. Return array of tasks (incomplete first, then completed, ordered by position within each group)

---

#### GET /api/tasks/important
**Purpose:** Get all important tasks across all lists

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "list_id": 1,
    "list_name": "My Day",
    "title": "Review pull requests",
    "is_important": true,
    "is_completed": false,
    "position": 1,
    "created_at": "2025-01-15T09:00:00Z",
    "completed_at": null
  },
  {
    "id": 5,
    "list_id": 2,
    "list_name": "Work",
    "title": "Prepare presentation",
    "is_important": true,
    "is_completed": false,
    "position": 1,
    "created_at": "2025-01-15T11:00:00Z",
    "completed_at": null
  }
]
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Query: 
   ```sql
   SELECT tasks.*, lists.name as list_name 
   FROM tasks 
   JOIN lists ON tasks.list_id = lists.id 
   WHERE tasks.user_id = ? AND tasks.is_important = true 
   ORDER BY tasks.is_completed ASC, tasks.created_at DESC
   ```
3. Return array of important tasks with list names

---

#### POST /api/lists/:list_id/tasks
**Purpose:** Create a new task in a specific list

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Buy milk"
}
```

**Response (Success - 201):**
```json
{
  "id": 10,
  "list_id": 1,
  "title": "Buy milk",
  "is_important": false,
  "is_completed": false,
  "position": 4,
  "created_at": "2025-01-15T15:00:00Z",
  "completed_at": null
}
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Verify list belongs to user
3. Calculate position: SELECT MAX(position) FROM tasks WHERE list_id = ?
4. Insert task with position = max_position + 1
5. Return created task

---

#### PATCH /api/tasks/:task_id
**Purpose:** Update task properties (title, is_important, is_completed)

**Headers:**
```
Authorization: Bearer <token>
```

**Request (examples):**
```json
// Mark as completed
{
  "is_completed": true
}

// Mark as important
{
  "is_important": true
}

// Edit title
{
  "title": "Buy almond milk"
}

// Multiple updates
{
  "title": "Urgent: Buy almond milk",
  "is_important": true
}
```

**Response (Success - 200):**
```json
{
  "id": 10,
  "list_id": 1,
  "title": "Urgent: Buy almond milk",
  "is_important": true,
  "is_completed": false,
  "position": 4,
  "created_at": "2025-01-15T15:00:00Z",
  "completed_at": null
}
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Verify task belongs to user
3. Update specified fields
4. If is_completed set to true → set completed_at = NOW()
5. If is_completed set to false → set completed_at = NULL
6. Return updated task

---

#### PATCH /api/lists/:list_id/tasks/reorder
**Purpose:** Update position values for drag-and-drop reordering

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "taskIds": [3, 1, 4, 2]
}
```
(Array of task IDs in desired order)

**Response (Success - 200):**
```json
{
  "message": "Tasks reordered"
}
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Verify list belongs to user
3. Verify all task IDs belong to this list
4. Update positions:
   ```sql
   UPDATE tasks SET position = 1 WHERE id = 3;
   UPDATE tasks SET position = 2 WHERE id = 1;
   UPDATE tasks SET position = 3 WHERE id = 4;
   UPDATE tasks SET position = 4 WHERE id = 2;
   ```
5. Return success message

---

#### DELETE /api/tasks/:task_id
**Purpose:** Delete a task

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Task deleted"
}
```

**Server Actions:**
1. Verify JWT token, get user_id
2. Verify task belongs to user
3. Delete task: DELETE FROM tasks WHERE id = ?
4. Return success message

---

### 4.4 API Error Responses

**401 Unauthorized (invalid/missing token):**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden (valid token, but not allowed):**
```json
{
  "error": "Forbidden"
}
```

**404 Not Found (resource doesn't exist):**
```json
{
  "error": "List not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## 5. WIREFRAMES AND UI SPECIFICATION

**Note:** For complete wireframe details including layout, component specifications, and interaction patterns, see the separate `wireframe_specification.md` document.

### 5.1 Key Layout Decisions

**Desktop (> 1024px):**
- Three-section layout: Header, Sidebar (250-300px), Main Content
- Sidebar always visible with all lists
- Hover interactions for task/list actions

**Tablet (640px - 1024px):**
- Same three-section layout
- Narrower sidebar (200px)
- Same hover interactions as desktop

**Mobile (< 640px):**
- Header with hamburger menu
- Sidebar as slide-out overlay (70-80% screen width)
- Swipe gestures for task actions (reveal-then-tap)
- Tap-and-hold for reordering

### 5.2 Core UI Components

- **Login/Signup Page**: Centered card with form inputs
- **Header**: App title, current list name (mobile), logout
- **Sidebar**: My Day, Important Tasks, custom lists, + New List
- **Task Item**: Checkbox, title, star icon (important), delete icon
- **Add Task Input**: Always-visible input with + button
- **Completed Tasks Section**: Grayed out, at bottom of list

### 5.3 Visual Hierarchy

**Task States:**
- Incomplete: Normal text, unchecked box, normal color
- Completed: Grayed text, checked box, moved to bottom
- Important: Star icon filled (vs outline), appears in Important Tasks view
- Hover (desktop): Show drag handle, star, delete icons

**List States:**
- Selected: Highlighted background in sidebar
- Default lists (My Day, Important): No edit/delete icons
- Custom lists: Edit/delete icons on hover

---

## 6. REACT COMPONENT STRUCTURE

### 6.1 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── SignUpForm.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── MainContent.jsx
│   ├── lists/
│   │   ├── ListItem.jsx
│   │   └── NewListButton.jsx
│   ├── tasks/
│   │   ├── TaskList.jsx
│   │   ├── TaskItem.jsx
│   │   ├── AddTaskInput.jsx
│   │   └── CompletedTasksSection.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── AuthPage.jsx
│   └── AppPage.jsx
├── context/
│   └── AuthContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useLists.js
│   └── useTasks.js
├── services/
│   └── api.js
├── utils/
│   ├── localStorage.js
│   ├── validation.js
│   └── constants.js
├── App.jsx
└── main.jsx
```

---

### 6.2 Component Specifications

#### 6.2.1 App.jsx (Root Component)

**Purpose:** Application root, routing setup

**Responsibilities:**
- Set up React Router with BrowserRouter
- Define routes (/ → AuthPage, /app → AppPage)
- Wrap app with AuthProvider context
- Protected route logic for /app

**State:** None (routing handled by React Router)

**Key Code Pattern:**
```jsx
<AuthProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

---

#### 6.2.2 AuthPage.jsx (Page Component)

**Purpose:** Container for login/signup views

**Props:** None

**State:**
- `isLogin` (boolean) - Toggle between login and signup forms

**Renders:**
- LoginForm (if isLogin === true)
- SignUpForm (if isLogin === false)
- Handles view switching via toggle functions

**Responsibilities:**
- Manage view state (login vs signup)
- Pass toggle functions to child forms
- Center card layout styling

---

#### 6.2.3 LoginForm.jsx

**Purpose:** Login form with validation

**Props:**
- `onSwitchToSignup` (function) - Callback to switch to signup view

**State:**
- `username` (string)
- `password` (string)
- `error` (string) - Error message to display
- `isLoading` (boolean) - Loading state during API call

**Functions:**
- `handleSubmit(e)` - Validate inputs, call login API
- `handleInputChange(e)` - Update state on input change

**Validation:**
- Username: Required
- Password: Required

**API Integration:**
- Calls `POST /api/auth/login`
- On success: Store token, redirect to /app
- On error: Display error message

---

#### 6.2.4 SignUpForm.jsx

**Purpose:** Registration form with validation

**Props:**
- `onSwitchToLogin` (function) - Callback to switch to login view

**State:**
- `username` (string)
- `password` (string)
- `confirmPassword` (string)
- `errors` (object) - Field-specific error messages
  - Example: `{ username: "Too short", confirmPassword: "Passwords don't match" }`
- `isLoading` (boolean)

**Functions:**
- `validate()` - Custom validation function, returns errors object
- `handleSubmit(e)` - Validate, call register API
- `handleInputChange(e)` - Update state and clear errors for changed field

**Validation Rules:**
- Username: Required, min 3 characters
- Password: Required, min 6 characters
- Confirm Password: Must match password

**API Integration:**
- Calls `POST /api/auth/register`
- On success: Store token, auto-login, redirect to /app
- On error: Display field-specific errors

---

#### 6.2.5 AppPage.jsx (Main Application Page)

**Purpose:** Main app container, manages lists and selected list state

**Props:** None

**State:**
- `lists` (array of list objects)
- `selectedListId` (number or "important")
- `isSidebarOpen` (boolean) - Mobile sidebar state
- `isLoading` (boolean)

**Hooks:**
- `useLists()` - Custom hook for list operations
- `useAuth()` - Get current user

**Effects:**
- Fetch lists on mount
- Set initial selectedListId to default list

**Functions:**
- `handleSelectList(listId)` - Update selectedListId, close sidebar (mobile)
- `handleToggleSidebar()` - Open/close sidebar (mobile)
- `handleCreateList(name)` - Create new list via API
- `handleUpdateList(id, name)` - Update list name
- `handleDeleteList(id)` - Delete list

**Renders:**
- Header (pass username, toggle sidebar function)
- Sidebar (pass lists, selected list, handlers)
- MainContent (pass selected list ID and name)

**Layout:**
- Desktop/Tablet: Flex layout with sidebar and main content
- Mobile: Stacked layout, sidebar as overlay

---

#### 6.2.6 Header.jsx

**Purpose:** Top navigation bar

**Props:**
- `username` (string)
- `onToggleSidebar` (function) - Mobile hamburger click
- `currentListName` (string) - For mobile display
- `isMobile` (boolean) - Determine layout

**State:** None

**Renders:**
- **Desktop/Tablet:** "[Username]'s To Do Lists" on left, Logout button on right
- **Mobile:** Hamburger icon (left), current list name (center), user menu (right)

**Functions:**
- `handleLogout()` - Call logout from useAuth, redirect to /login

**Styling:**
- Fixed height, full width
- Flex layout with space-between
- Responsive based on screen size

---

#### 6.2.7 Sidebar.jsx

**Purpose:** List navigation

**Props:**
- `lists` (array)
- `selectedListId` (number or "important")
- `onSelectList` (function)
- `onCreateList` (function)
- `onUpdateList` (function)
- `onDeleteList` (function)
- `isOpen` (boolean) - Mobile overlay state
- `onClose` (function) - Mobile close sidebar

**State:**
- `editingListId` (number or null) - Track which list is being renamed

**Renders:**
- Fixed "My Day" list (ListItem, not editable/deletable)
- Fixed "Important Tasks" list (ListItem, not editable/deletable)
- Divider
- Custom lists mapped from props (ListItem for each)
- NewListButton at bottom

**Functions:**
- `handleListClick(listId)` - Call onSelectList, close sidebar (mobile)
- `handleEditList(listId)` - Set editingListId
- `handleSaveEdit(listId, newName)` - Call onUpdateList, clear editingListId

**Mobile Specific:**
- Overlay styling with dark background
- Slide-in/out animation
- Close on background click or list selection

---

#### 6.2.8 ListItem.jsx

**Purpose:** Single list in sidebar

**Props:**
- `list` (object: { id, name, is_default })
- `isSelected` (boolean)
- `isEditing` (boolean)
- `onSelect` (function)
- `onEdit` (function)
- `onSave` (function)
- `onDelete` (function)

**State:**
- `editedName` (string) - Temp value during inline editing

**Renders:**
- List name (or input if editing)
- Highlight if selected
- Edit/delete icons on hover (if not default list)

**Functions:**
- `handleClick()` - Call onSelect if not editing
- `handleEditClick()` - Call onEdit to enter edit mode
- `handleSaveClick()` - Call onSave with new name
- `handleDeleteClick()` - Call onDelete

**Mobile Interactions:**
- Long-press to show edit/delete options
- Or swipe left to reveal delete

---

#### 6.2.9 NewListButton.jsx

**Purpose:** Create new list button

**Props:**
- `onCreate` (function)

**State:** None

**Renders:**
- Button with "+ New List" text

**Functions:**
- `handleClick()` - Call onCreate

---

#### 6.2.10 MainContent.jsx

**Purpose:** Display tasks for selected list

**Props:**
- `selectedListId` (number or "important")
- `listName` (string)

**State:**
- `tasks` (array of task objects)
- `isLoading` (boolean)

**Hooks:**
- `useTasks()` - Custom hook for task operations

**Effects:**
- Fetch tasks when selectedListId changes
- If selectedListId === "important", fetch important tasks
- Otherwise, fetch tasks for specific list

**Functions:**
- `handleAddTask(title)` - Create new task
- `handleToggleComplete(taskId)` - Toggle is_completed
- `handleToggleImportant(taskId)` - Toggle is_important
- `handleUpdateTask(taskId, updates)` - Update task (title, etc.)
- `handleDeleteTask(taskId)` - Delete task
- `handleReorderTasks(oldIndex, newIndex)` - Reorder via drag-and-drop

**Renders:**
- List title (editable if custom list)
- AddTaskInput component
- TaskList component (incomplete tasks)
- CompletedTasksSection component

---

#### 6.2.11 AddTaskInput.jsx

**Purpose:** Input for creating new tasks

**Props:**
- `listId` (number)
- `onAddTask` (function)

**State:**
- `taskTitle` (string)
- `isSubmitting` (boolean)

**Functions:**
- `handleSubmit(e)` - Validate (not empty), call onAddTask, clear input
- `handleKeyPress(e)` - Submit on Enter key

**Renders:**
- Input field with placeholder "Add a task..."
- "+" button

**Validation:**
- Title required (not empty)
- If empty, don't submit

---

#### 6.2.12 TaskList.jsx

**Purpose:** List of incomplete tasks with drag-and-drop

**Props:**
- `tasks` (array of incomplete tasks)
- `onToggleComplete` (function)
- `onToggleImportant` (function)
- `onUpdateTask` (function)
- `onDeleteTask` (function)
- `onReorderTasks` (function)

**State:**
- `draggedTaskId` (number or null) - Track which task is being dragged

**Hooks:**
- `useSortable` from dnd-kit for drag-and-drop

**Renders:**
- Maps tasks to TaskItem components
- Wraps with DndContext from dnd-kit

**Functions:**
- `handleDragEnd(event)` - Calculate new order, call onReorderTasks

**dnd-kit Integration:**
- Uses SortableContext with verticalListSortingStrategy
- Each TaskItem is a sortable element
- Smooth animations and touch support

---

#### 6.2.13 TaskItem.jsx

**Purpose:** Single task display with all interactions

**Props:**
- `task` (object: { id, title, is_important, is_completed, position })
- `onToggleComplete` (function)
- `onToggleImportant` (function)
- `onUpdate` (function)
- `onDelete` (function)
- `listName` (string, optional) - For Important Tasks view

**State:**
- `isEditing` (boolean) - Inline edit mode
- `editedTitle` (string) - Temp value during editing
- `swipeState` (string) - 'none', 'showImportant', 'showDelete' (mobile)
- `touchStart` (number) - Touch position for swipe detection
- `touchEnd` (number)

**Desktop/Tablet Interactions:**
- Hover shows drag handle, star, delete icons
- Click checkbox → onToggleComplete
- Click text → enter edit mode
- Click star → onToggleImportant
- Click delete → onDelete
- Drag handle for reordering (via dnd-kit)

**Mobile Interactions:**
- Tap checkbox → onToggleComplete
- Tap text → enter edit mode
- Swipe right → reveal star icon (tap to toggle important)
- Swipe left → reveal delete icon (tap to delete)
- Tap-and-hold → drag mode for reordering

**Functions:**
- `handleCheckboxClick()` - Toggle complete
- `handleTitleClick()` - Enter edit mode
- `handleTitleSave()` - Call onUpdate with new title
- `handleStarClick()` - Toggle important
- `handleDeleteClick()` - Delete task
- Touch event handlers for swipe gestures

**Renders:**
- Checkbox (left)
- Task title (center, editable on click)
- Star icon (hover/swipe, filled if important)
- Delete icon (hover/swipe)
- Drag handle (hover, desktop/tablet)
- Optional list name badge (if in Important Tasks view)

---

#### 6.2.14 CompletedTasksSection.jsx

**Purpose:** Display completed tasks at bottom

**Props:**
- `tasks` (array of completed tasks)
- `onToggleComplete` (function)
- `onToggleImportant` (function)
- `onDelete` (function)

**State:** None

**Renders:**
- Section header: "Completed"
- Maps completed tasks to TaskItem components
- TaskItems styled with grayed text, checked box

**Styling:**
- Grayed out text
- Strike-through (optional)
- Separated from incomplete tasks with visual divider

---

### 6.3 Context and Hooks

#### 6.3.1 AuthContext.jsx

**Purpose:** Global authentication state

**Provides:**
- `user` (object or null): { id, username }
- `token` (string or null): JWT token
- `isLoading` (boolean): Initial auth check
- `login(username, password)` - Login function
- `logout()` - Logout function
- `register(username, password)` - Register function

**State:**
- `user`, `token`, `isLoading`

**Effects:**
- On mount: Check localStorage for token, validate with GET /api/user/me

**Functions:**
- `login()` - Call login API, store token, set user
- `logout()` - Remove token from localStorage, clear user, redirect
- `register()` - Call register API, auto-login

---

#### 6.3.2 useAuth Hook

**Purpose:** Access AuthContext

**Returns:** All values from AuthContext

**Usage:**
```jsx
const { user, login, logout, isLoading } = useAuth();
```

---

#### 6.3.3 useLists Hook

**Purpose:** List CRUD operations

**Returns:**
- `lists` (array)
- `isLoading` (boolean)
- `fetchLists()` - GET /api/lists
- `createList(name)` - POST /api/lists
- `updateList(id, name)` - PUT /api/lists/:id
- `deleteList(id)` - DELETE /api/lists/:id

**State:**
- `lists`, `isLoading`

**Functions:**
- Each function calls appropriate API endpoint
- Updates local state on success
- Handles errors

---

#### 6.3.4 useTasks Hook

**Purpose:** Task CRUD operations

**Returns:**
- `tasks` (array)
- `isLoading` (boolean)
- `fetchTasks(listId)` - GET /api/lists/:listId/tasks
- `fetchImportantTasks()` - GET /api/tasks/important
- `createTask(listId, title)` - POST /api/lists/:listId/tasks
- `updateTask(id, updates)` - PATCH /api/tasks/:id
- `deleteTask(id)` - DELETE /api/tasks/:id
- `reorderTasks(listId, taskIds)` - PATCH /api/lists/:listId/tasks/reorder

**State:**
- `tasks`, `isLoading`

**Functions:**
- Each function calls appropriate API endpoint
- Updates local state
- Handles errors

---

### 6.4 Services

#### 6.4.1 api.js

**Purpose:** Axios instance and API functions

**Setup:**
- Create axios instance with base URL
- Add request interceptor to include JWT token in headers
- Add response interceptor to handle 401 errors (logout on invalid token)

**Functions:**
```javascript
// Auth
export const registerUser = (username, password) => { ... }
export const loginUser = (username, password) => { ... }
export const getCurrentUser = () => { ... }

// Lists
export const getLists = () => { ... }
export const createList = (name) => { ... }
export const updateList = (id, name) => { ... }
export const deleteList = (id) => { ... }

// Tasks
export const getTasks = (listId) => { ... }
export const getImportantTasks = () => { ... }
export const createTask = (listId, title) => { ... }
export const updateTask = (id, updates) => { ... }
export const deleteTask = (id) => { ... }
export const reorderTasks = (listId, taskIds) => { ... }
```

**Axios Interceptors:**
```javascript
// Request interceptor - add token to headers
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 6.5 Utilities

#### 6.5.1 localStorage.js

**Functions:**
```javascript
export const getToken = () => localStorage.getItem('jwt_token');
export const setToken = (token) => localStorage.setItem('jwt_token', token);
export const removeToken = () => localStorage.removeItem('jwt_token');
```

---

#### 6.5.2 validation.js

**Functions:**
```javascript
export const validateUsername = (username) => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  return null; // No error
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};
```

---

#### 6.5.3 constants.js

**Constants:**
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const DEFAULT_LIST_NAME = 'My Day';
export const IMPORTANT_LIST_ID = 'important';
export const SWIPE_THRESHOLD = 50; // pixels
export const TAP_HOLD_DURATION = 500; // milliseconds
```

---

### 6.6 Data Flow Summary

**Authentication Flow:**
1. User logs in via LoginForm
2. LoginForm calls `login()` from useAuth
3. useAuth calls API, receives token
4. Token stored in localStorage
5. User set in AuthContext
6. App redirects to /app

**List Selection Flow:**
1. User clicks list in Sidebar
2. Sidebar calls onSelectList (from AppPage)
3. AppPage updates selectedListId state
4. MainContent receives new selectedListId prop
5. MainContent's useEffect calls fetchTasks(selectedListId)
6. useTasks fetches from API, updates tasks state
7. TaskList re-renders with new tasks

**Task Creation Flow:**
1. User types in AddTaskInput, presses Enter
2. AddTaskInput calls onAddTask (from MainContent)
3. MainContent calls createTask from useTasks
4. useTasks calls API, receives new task
5. useTasks adds task to local state
6. TaskList re-renders with new task visible

---

## 7. TECHNICAL STACK

### 7.1 Frontend

**Framework:**
- React 18+ (latest stable)
- Vite (build tool and dev server)

**Routing:**
- React Router DOM v6

**Styling:**
- Tailwind CSS

**State Management:**
- React Context API (for auth)
- Component state (useState)
- Custom hooks for data fetching

**Drag and Drop:**
- dnd-kit (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)

**HTTP Client:**
- Axios

**Other Dependencies:**
- None (no toast libraries, no form libraries - custom implementations)

---

### 7.2 Backend

**Runtime:**
- Node.js (v18+ recommended)

**Framework:**
- Express.js

**Authentication:**
- JSON Web Tokens (JWT) - jsonwebtoken library
- bcrypt - password hashing

**Database Driver:**
- mysql2 (or mysql)

**Middleware:**
- cors - Cross-origin resource sharing
- express.json() - Parse JSON request bodies
- Custom JWT verification middleware

**Other Dependencies:**
- dotenv - Environment variables

---

### 7.3 Database

**Database:**
- MySQL 8.0+

**Schema:**
- 3 tables: users, lists, tasks
- Foreign key constraints with CASCADE deletion

---

### 7.4 Development Tools

**Linting:**
- ESLint (React + JavaScript)

**Code Formatting:**
- Prettier (optional)

**Version Control:**
- Git

**Package Manager:**
- npm or yarn

---

### 7.5 Deployment Considerations

**Frontend:**
- Build with Vite: `npm run build`
- Deploy to Netlify, Vercel, or similar static hosting
- Environment variable for API URL

**Backend:**
- Deploy to Heroku, Railway, Render, or similar Node.js hosting
- Environment variables for:
  - DATABASE_URL
  - JWT_SECRET
  - PORT

**Database:**
- MySQL hosting (PlanetScale, AWS RDS, or similar)
- Or use managed MySQL service

---

### 7.6 Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000
```

**Backend (.env):**
```
PORT=3000
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=todo_app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

---

### 7.7 Dependencies Summary

**Frontend package.json:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.55.0"
  }
}
```

**Backend package.json:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 8. IMPLEMENTATION ROADMAP

### 8.1 Recommended Build Order

**Phase 1: Backend Foundation**
1. Set up Node.js + Express server
2. Connect to MySQL database
3. Create database schema (users, lists, tasks tables)
4. Implement authentication endpoints (register, login, user/me)
5. Test with Postman or similar

**Phase 2: Backend Core Features**
6. Implement list endpoints (GET, POST, PUT, DELETE)
7. Implement task endpoints (GET, POST, PATCH, DELETE)
8. Implement reorder endpoint
9. Test all endpoints thoroughly

**Phase 3: Frontend Foundation**
10. Set up React + Vite + Tailwind
11. Set up React Router
12. Create AuthContext and useAuth hook
13. Build login/signup forms with custom validation
14. Implement JWT storage and axios interceptors

**Phase 4: Frontend Core Features**
15. Build AppPage layout (Header, Sidebar, MainContent)
16. Implement list display and selection
17. Implement task display (TaskList, TaskItem)
18. Implement task creation (AddTaskInput)
19. Implement task completion toggle

**Phase 5: Advanced Features**
20. Implement task editing (inline)
21. Implement important tasks toggle and view
22. Implement list creation, editing, deletion
23. Implement task deletion
24. Implement drag-and-drop reordering (dnd-kit)

**Phase 6: Responsive Design**
25. Implement mobile sidebar (hamburger menu, overlay)
26. Implement mobile swipe gestures for tasks
27. Implement tap-and-hold reordering on mobile
28. Test responsive design across breakpoints

**Phase 7: Polish and Testing**
29. Add loading states and error handling
30. Add empty states
31. Refine animations and transitions
32. Cross-browser testing
33. Mobile device testing
34. Performance optimization

**Phase 8: Deployment**
35. Deploy backend to hosting service
36. Deploy frontend to static hosting
37. Configure environment variables
38. Set up production database
39. Final testing in production

---

### 8.2 Testing Strategy

**Backend Testing:**
- Manual API testing with Postman during development
- Test all CRUD operations
- Test authentication flow
- Test error cases (invalid tokens, missing data, etc.)

**Frontend Testing:**
- Manual testing in browser during development
- Test all user flows
- Test responsive design at different breakpoints
- Test on actual mobile devices (not just browser DevTools)
- Cross-browser testing (Chrome, Firefox, Safari)

**Integration Testing:**
- Test complete user journeys end-to-end
- Test error scenarios (network failures, invalid data)
- Test edge cases (empty states, concurrent actions, etc.)

---

## 9. FUTURE ENHANCEMENTS

Ideas for future iterations (not in current scope):

1. **Real-time Sync:** WebSockets for multi-device updates
2. **Due Dates:** Add due_date field to tasks, calendar view
3. **Subtasks:** Nested task support
4. **Tags/Categories:** Flexible task organization beyond lists
5. **Search:** Full-text search across tasks
6. **Filters/Sorting:** Sort by date, importance, alphabetical
7. **Recurring Tasks:** Auto-create tasks on schedule
8. **Attachments:** Upload files to tasks
9. **Collaboration:** Share lists with other users
10. **Dark Mode:** Theme toggle
11. **Notifications:** Browser notifications for reminders
12. **Export/Import:** Backup and restore data
13. **Analytics:** Task completion statistics, productivity insights
14. **Integrations:** Calendar sync, email import
15. **Mobile Apps:** Native iOS/Android apps (React Native)

---

## END OF DESIGN DOCUMENT

This document represents the complete design specification for the minimal to-do list web application. All design decisions have been finalized and documented for implementation.

**Last Updated:** January 2025
**Version:** 1.0
**Status:** Ready for Development
