# WIREFRAME SPECIFICATION - TO-DO LIST APP

## TABLE OF CONTENTS
1. Login/Sign-Up Page
2. Main App Layout - Desktop
3. Main App Layout - Tablet
4. Main App Layout - Mobile
5. Component Details
6. Interaction Patterns
7. Responsive Behavior Summary

---

## 1. LOGIN/SIGN-UP PAGE

### Layout
- Centered card in middle of viewport
- Clean, minimal design
- Card dimensions:
  - **Mobile**: 90% screen width with padding
  - **Tablet/Desktop**: Fixed ~400px width

### Login View Elements
- App title/logo at top
- Username input field
- Password input field
- "Login" button (primary action)
- "Sign up" link (switches to registration view)
- "Forgot password" link (placeholder for future implementation)

### Registration View Elements
- App title/logo at top
- Username input field
- Password input field
- Confirm Password input field
- "Create Account" button (primary action)
- "Already have an account? Login" link (switches back to login view)

### Validation & Error Handling
- Validation occurs on form submission
- If validation fails:
  - Account is NOT created
  - Form remains visible
  - Invalid fields get visual indicators (red border, error text)
  - Specific error messages display:
    - "Username is required"
    - "Username already exists"
    - "Password must be at least X characters"
    - "Passwords do not match"

### Post-Registration Flow
- Successful registration automatically logs user in
- JWT token stored in localStorage
- User redirected to main app
- "My Day" default list automatically created
- User starts with empty "My Day" and "Important Tasks" lists

---

## 2. MAIN APP LAYOUT - DESKTOP (> 1024px)

### Overall Structure
```
+------------------------------------------+
|            HEADER (full width)           |
+------------+-----------------------------+
|  SIDEBAR   |    MAIN CONTENT AREA        |
| (250-300px)|                             |
|            |                             |
|  My Day    |    Current List Title       |
|  Important |    ----------------------   |
|  --------  |    + Add Task Input         |
|  Work      |                             |
|  Personal  |    [ ] Task 1               |
|  Groceries |    [ ] Task 2               |
|            |    [x] Completed Task       |
|  + New List|                             |
+------------+-----------------------------+
```

### Header Section
- Full width bar across top
- **Left side**: "[Username]'s To Do Lists"
- **Right side**: Logout button/icon
- Fixed position (stays visible when scrolling)

### Sidebar Section (Left Column)
- Fixed width: 250-300px
- Scrollable if content exceeds viewport height
- Background color distinct from main content

**Structure (top to bottom):**

1. **My Day** (default list, permanent)
   - Cannot be deleted or renamed
   - Click to select and view tasks
   - Highlight when selected

2. **Important Tasks** (special aggregator list, permanent)
   - Cannot be deleted or renamed
   - Star icon to indicate special status
   - Click to select and view all important tasks across all lists
   - Highlight when selected

3. **Divider line**

4. **User's Custom Lists**
   - Listed in creation order (or alphabetically)
   - Each list shows:
     - List name (click to select)
     - On hover: Edit icon (pencil) + Delete icon (trash)
   - Selected list has highlight/active background color
   - Click list name to view its tasks
   - Click edit icon → list name becomes editable inline
   - Click delete icon → list is deleted (with confirmation?)

5. **+ New List button** (bottom of sidebar)
   - Clicking creates new list with default name
   - Name immediately editable (input focused)

### Main Content Area (Right Side)
- Flexible width (fills remaining space after sidebar)
- Scrollable vertically

**Structure (top to bottom):**

1. **List Title Header**
   - Current list name displayed (e.g., "My Day", "Work", "Important Tasks")
   - For custom lists: title editable inline

2. **Add Task Section**
   - Always-visible input field
   - Placeholder text: "Add a task..."
   - "+" button on right side of input
   - Pressing Enter or clicking "+" creates task
   - Input clears after task creation

3. **Incomplete Tasks Section**
   - Tasks ordered by position field (drag-and-drop)
   - Each task row contains:
     - **Checkbox** (left side) - click to mark complete
     - **Task text** (center) - click to edit inline
     - **Drag handle** (left of checkbox or on hover)
     - **Hover state reveals**:
       - Star icon (mark/unmark important) - filled if already important
       - Delete icon (trash can)
   - Visual spacing between tasks for clarity

4. **Completed Tasks Section**
   - Automatically appears below incomplete tasks
   - Same structure as incomplete tasks but:
     - Grayed out text
     - Checkbox is checked
     - Can be unchecked to return to incomplete
     - Still shows hover icons (star, delete)
     - Can be deleted from completed state

### Important Tasks View Specifics
- When "Important Tasks" is selected in sidebar
- Main area shows all important tasks from all lists
- Each task includes:
  - All standard task elements (checkbox, text, icons)
  - **Small label/tag** showing which list it belongs to
  - Example: "Buy milk" with small "Groceries" tag
- Tasks still editable, completable, deletable
- Unmarking as important removes from this view

---

## 3. MAIN APP LAYOUT - TABLET (640px - 1024px)

### Overall Structure
```
+------------------------------------------+
|            HEADER (full width)           |
+----------+-------------------------------+
| SIDEBAR  |    MAIN CONTENT AREA          |
| (200px)  |                               |
|          |                               |
| My Day   |    Current List Title         |
| Important|    ----------------------     |
| -------- |    + Add Task Input           |
| Work     |                               |
| Personal |    [ ] Task 1                 |
|          |    [ ] Task 2                 |
| + New    |    [x] Completed Task         |
+----------+-------------------------------+
```

### Key Differences from Desktop
- **Sidebar width reduced**: 200px instead of 250-300px
- List names may truncate if too long (add ellipsis)
- Main content area gets proportionally more space
- All other functionality identical to desktop
- Hover interactions still work (tablet with mouse or touch)

---

## 4. MAIN APP LAYOUT - MOBILE (< 640px)

### Sidebar Closed (Default State)
```
+-------------------------------+
| ☰ | Current List Name    | ⋮  |
+-------------------------------+
|                               |
|   + Add a task...        [+]  |
|                               |
+-------------------------------+
|  [ ] Task 1                   |
+-------------------------------+
|  [ ] Task 2                   |
+-------------------------------+
|  [x] Completed task           |
+-------------------------------+
|                               |
+-------------------------------+
```

### Sidebar Open (Overlay)
```
+-------------------------------+
|████████████████|  (darkened)  |
|█ Lists        █|   background |
|█              █|              |
|█ My Day       █|              |
|█ Important    █|              |
|█ ------------ █|              |
|█ Work         █|              |
|█ Personal     █|              |
|█ Groceries    █|              |
|█              █|              |
|█ + New List   █|              |
|████████████████|              |
+-------------------------------+
```

### Header
- **Left**: Hamburger icon (☰) - opens sidebar overlay
- **Center**: Current list name (e.g., "My Day", "Work")
- **Right**: User menu icon (⋮) - opens dropdown with logout option
- Fixed position at top

### Sidebar (Overlay State)
- Slides in from left with smooth animation
- Width: 70-80% of screen width (or 280px max, whichever is smaller)
- Semi-transparent dark background behind sidebar
- Contains same content as desktop sidebar:
  - My Day
  - Important Tasks
  - Divider
  - Custom lists
  - + New List button
- **Closing behavior**:
  - Tap outside sidebar (on darkened background)
  - Select a list (auto-closes after selection)
  - Tap hamburger icon again
  - Slides out with smooth animation

### Main Content Area
- Full width when sidebar closed
- Vertically scrollable
- Add task input at top (full width)
- Tasks displayed in vertical list
- More vertical spacing between tasks for easier touch targets

### Mobile-Specific Touch Targets
- All interactive elements minimum 44px × 44px
- Checkboxes larger: ~24px
- Increased padding in inputs and buttons
- Larger font sizes:
  - Task text: 18px (text-lg)
  - Compared to desktop: 16px (text-base)

---

## 5. COMPONENT DETAILS

### Task Item Component

**Desktop/Tablet Structure:**
```
+-----------------------------------------------+
| [≡] [ ] Task text here           [★] [🗑️]   |
+-----------------------------------------------+
```
- **[≡]** Drag handle (visible on hover)
- **[ ]** Checkbox
- **Task text** - Click to edit inline
- **[★]** Star icon (visible on hover) - Toggle important
- **[🗑️]** Delete icon (visible on hover)

**Mobile Structure (Default):**
```
+-----------------------------------------------+
| [ ] Task text here                            |
+-----------------------------------------------+
```

**Mobile - Swipe Right (Reveal Important):**
```
+-----------------------------------------------+
| [★] [ ] Task text here                        |
+-----------------------------------------------+
```
- Swipe right 30-40% of task width
- Star icon reveals on left
- Tap star to toggle important
- Swipe left or tap elsewhere to hide

**Mobile - Swipe Left (Reveal Delete):**
```
+-----------------------------------------------+
| [ ] Task text here                      [🗑️] |
+-----------------------------------------------+
```
- Swipe left 30-40% of task width
- Delete icon reveals on right
- Tap delete to remove task
- Swipe right or tap elsewhere to hide

**Mobile - Tap and Hold (Reorder Mode):**
- User taps and holds task for ~500ms
- Haptic feedback (if available)
- Task visually lifts (larger, shadow)
- Task follows finger as user drags
- Other tasks animate to show drop position
- Release to drop in new position
- Position saved to database

**Completed Task Appearance:**
- Checkbox: checked/filled
- Text: grayed out, strike-through (optional)
- Automatically moves to bottom of list
- Still shows hover/swipe actions
- Can be unchecked to mark incomplete

### List Item Component (Sidebar)

**Desktop/Tablet:**
```
+------------------------+
| List Name      [✏️][🗑️]|
+------------------------+
```
- List name clickable to select
- Edit and delete icons visible on hover
- Selected list has background highlight
- Click edit → inline editing mode
- My Day and Important Tasks: no edit/delete icons

**Mobile (in sidebar overlay):**
- Tap list name to select (closes sidebar)
- Long-press on list to reveal edit/delete options
- OR swipe left to reveal delete option
- Edit mode: inline editing with keyboard

### Add Task Input

**Desktop/Tablet:**
```
+-------------------------------------------+
| + Add a task...                      [+]  |
+-------------------------------------------+
```
- Full width input field
- Placeholder text visible when empty
- "+" button always visible on right
- Press Enter or click "+" to create task

**Mobile:**
```
+-------------------------------------------+
| + Add a task...                      [+]  |
+-------------------------------------------+
```
- Same as desktop but full width
- Mobile keyboard appears when focused
- Press Enter or tap "+" to create

### New List Creation

**All Devices:**
1. Click/tap "+ New List" button
2. New list appears with default name "New List" (or "Untitled List")
3. Name is immediately in edit mode (input focused)
4. User types name
5. Press Enter or click/tap outside to save
6. List appears in sidebar in custom lists section

---

## 6. INTERACTION PATTERNS

### Creating a Task
1. Type in "Add a task..." input field
2. Press Enter or click/tap "+" button
3. Task appears at bottom of incomplete tasks section
4. Task assigned next position value (max position + 1)
5. Input field clears, ready for next task

### Completing a Task
1. Click/tap checkbox next to task
2. Task marked as complete in database (is_completed = true)
3. Checkbox fills/checks
4. Task text grays out
5. Task animates/moves to completed section at bottom
6. completed_at timestamp set

### Uncompleting a Task
1. Click/tap checked checkbox in completed section
2. Task marked as incomplete (is_completed = false)
3. Checkbox unchecks
4. Task text returns to normal color
5. Task moves back to incomplete section
6. Positioned at bottom of incomplete tasks
7. completed_at timestamp cleared

### Editing a Task
1. Click/tap on task text
2. Text becomes editable input field
3. Text is highlighted/selected for easy editing
4. User edits text
5. Press Enter or click/tap outside to save
6. Text updates in database
7. Display updates to show new text

### Marking Task as Important
1. **Desktop/Tablet**: Hover over task, click star icon
2. **Mobile**: Swipe right to reveal star, tap star
3. Task is_important flag set to true in database
4. Star icon changes appearance (filled vs outline)
5. Task appears in "Important Tasks" list
6. If currently viewing Important Tasks list, task appears there

### Unmarking Task as Important
1. Same interaction as marking (click/tap filled star)
2. is_important flag set to false
3. Star icon returns to outline state
4. Task removed from "Important Tasks" list
5. Still visible in original list

### Deleting a Task
1. **Desktop/Tablet**: Hover over task, click delete icon
2. **Mobile**: Swipe left to reveal delete, tap delete icon
3. Optional: Confirmation dialog appears
4. Task deleted from database
5. Task removed from UI with animation
6. If task was important, also removed from Important Tasks view

### Reordering Tasks (Desktop/Tablet)
1. Hover over task to reveal drag handle
2. Click and hold drag handle
3. Drag task up or down
4. Other tasks shift to show drop position
5. Release to drop task in new position
6. Position values updated in database for affected tasks
7. API call: PATCH /api/lists/:listId/tasks/reorder

### Reordering Tasks (Mobile)
1. Tap and hold task for ~500ms
2. Haptic feedback + visual change (task lifts)
3. Task follows finger movement
4. Other tasks animate to show drop position
5. Release finger to drop task
6. Position values updated in database
7. Same API call as desktop

### Creating a List
1. Click/tap "+ New List" button in sidebar
2. New list created in database with default name
3. List appears in sidebar with name in edit mode
4. User types desired name
5. Press Enter or click/tap outside to save
6. List name updates in database

### Renaming a List
1. **Desktop/Tablet**: Hover over list, click edit icon
2. **Mobile**: Long-press list or swipe to reveal edit option
3. List name becomes editable input
4. User edits name
5. Press Enter or click/tap outside to save
6. List name updates in database
7. If currently viewing this list, title in main area updates

### Deleting a List
1. **Desktop/Tablet**: Hover over list, click delete icon
2. **Mobile**: Long-press or swipe left to reveal delete option
3. Optional: Confirmation dialog ("Delete this list and all its tasks?")
4. List deleted from database (CASCADE deletes all tasks)
5. List removed from sidebar
6. If currently viewing deleted list, switch to "My Day" default view

### Switching Between Lists
1. Click/tap list name in sidebar
2. **Mobile**: Sidebar closes with animation
3. Main content area updates to show selected list's tasks
4. List title updates in header/main area
5. Tasks load via API: GET /api/lists/:listId/tasks
6. Selected list highlighted in sidebar

### Viewing Important Tasks
1. Click/tap "Important Tasks" in sidebar
2. **Mobile**: Sidebar closes
3. Main area shows all tasks where is_important = true
4. Each task shows small label indicating source list
5. Tasks load via API: GET /api/tasks/important
6. All standard task operations available (complete, edit, delete, unmark important)

### Logout
1. Click/tap logout button (desktop) or user menu icon → logout (mobile)
2. JWT token removed from localStorage
3. User redirected to login page
4. Session ends

### Page Refresh / App Reload
1. App checks localStorage for JWT token
2. If token exists:
   - Call GET /api/user/me to verify token validity
   - If valid: Display main app, load user's lists
   - If invalid/expired: Redirect to login, clear localStorage
3. If no token exists: Redirect to login page

---

## 7. RESPONSIVE BEHAVIOR SUMMARY

| Feature | Desktop (>1024px) | Tablet (640-1024px) | Mobile (<640px) |
|---------|-------------------|---------------------|-----------------|
| **Sidebar** | Always visible (250-300px) | Always visible (200px) | Hamburger menu + overlay |
| **Sidebar Lists** | Hover for edit/delete icons | Hover for edit/delete icons | Long-press or swipe left |
| **Task Actions** | Hover for star/delete icons | Hover for star/delete icons | Swipe gestures (reveal-then-tap) |
| **Task Reordering** | Click-and-drag with handle | Click-and-drag with handle | Tap-and-hold for 500ms |
| **Task Editing** | Click text to edit inline | Click text to edit inline | Tap text to edit inline |
| **List Selection** | Click in sidebar | Click in sidebar | Tap in overlay sidebar (auto-closes) |
| **Header Content** | Full title + logout button | Full title + logout button | Hamburger + list name + menu |
| **Add Task Input** | Full width with + button | Full width with + button | Full width with + button |
| **Font Sizes** | Base (16px) | Base (16px) | Larger (18px) |
| **Touch Targets** | Standard sizing | Standard sizing | Minimum 44px × 44px |
| **Spacing** | Standard | Standard | Increased vertical spacing |

---

## NOTES

- All animations should be smooth (200-300ms transitions)
- Use consistent color scheme across all components
- Maintain visual hierarchy (headers larger, completed tasks grayed)
- Ensure sufficient color contrast for accessibility
- Consider adding loading states for API calls
- Consider adding empty states ("No tasks yet! Add one above")
- Consider adding toast notifications for actions (success/error messages)
- Important Tasks list icon: use distinctive star or similar icon
- My Day list icon: calendar or sun icon (optional)
- Completed tasks section: collapsible on mobile? (optional enhancement)

---

END OF WIREFRAME SPECIFICATION
