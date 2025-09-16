# Chat Interface with Sidebar Implementation Plan

## Acceptance Criteria

### Must Have (Required for completion)
- [ ] Sidebar with collapsible functionality using existing shadcn/ui sidebar components
- [ ] Conversation history grouped by date (Today, Yesterday, Last 7 days, This month, Older)
- [ ] Starred section above conversations showing starred chats and projects
- [ ] Top navigation with three buttons: New Chat, Chats, Projects
- [ ] Main chat area displaying selected conversation using existing chat components
- [ ] Responsive design that works on mobile and desktop
- [ ] Uses only existing shadcn/ui color system (no custom colors)
- [ ] UI matches provided Claude-like screenshot design

### Should Have (Nice to have)
- [ ] Smooth animations for sidebar collapse/expand
- [ ] Hover states and interactive feedback
- [ ] Keyboard navigation support
- [ ] Search functionality in sidebar
- [ ] Context menus for conversation actions (archive, delete, star)

### Acceptance Testing
- [ ] Sidebar collapses properly on mobile screens
- [ ] Conversations are correctly grouped by date
- [ ] Starred items appear in dedicated section
- [ ] Navigation buttons work correctly
- [ ] Color scheme matches existing design system
- [ ] Chat functionality works with new layout
- [ ] Responsive breakpoints work as expected

---

## Overview
Create a chat interface similar to Claude's UI with a collapsible sidebar containing conversation history, starred items, and quick navigation.

## Technical Approach

### Responsive Strategy
- Use Tailwind's built-in responsive classes (sm:, md:, lg:, xl:) instead of custom mobile detection
- Sidebar will use existing shadcn/ui sidebar component which handles responsive behavior
- No custom mobile hooks needed

### Components to Create

#### 1. Utility Functions
- **`lib/date-utils.ts`** ✅ - Date grouping and formatting utilities
- **`lib/mock-data.ts`** - Sample conversations and projects for demonstration

#### 2. Sidebar Components
- **`components/chat/conversation-sidebar.tsx`** - Main sidebar component
- **`components/chat/conversation-item.tsx`** - Individual conversation list item
- **`components/chat/conversation-group.tsx`** - Date-grouped conversation lists
- **`components/chat/starred-section.tsx`** - Starred conversations and projects section
- **`components/chat/sidebar-navigation.tsx`** - Top navigation (New Chat, Chats, Projects)

#### 3. Main Layout
- **`components/chat/chat-layout.tsx`** - Main layout combining sidebar + chat area
- **`app/page.tsx`** - Update to use new chat layout

## Implementation Details

### Date Grouping Logic
- **Today**: Conversations from today
- **Yesterday**: Conversations from yesterday
- **Last 7 days**: Conversations from past week (excluding today/yesterday)
- **This month**: Conversations from current month (excluding recent days)
- **Older**: Everything else

### Starred Section
- Above conversation history
- Shows starred conversations AND projects
- Star icon toggle on hover/selection
- Uses lucide-react Star icon

### Navigation
- **New Chat** - Button to start new conversation
- **Chats** - Active by default, shows conversation history
- **Projects** - Navigate to projects view
- Clean, minimal design matching screenshot

### Responsive Design
- Sidebar collapses on mobile using existing sidebar component
- Uses Tailwind responsive classes (sm:, md:, lg:, xl:)
- Proper touch targets for mobile
- Uses existing shadcn/ui breakpoints

### Styling
- Uses existing shadcn/ui color system (no custom colors)
- Follows sidebar design patterns already established
- Matches Claude-like visual hierarchy from screenshot
- Proper hover states and interactive feedback
- Consistent with existing chat component styling

## File Structure
```
lib/
  date-utils.ts ✅
  mock-data.ts

components/chat/
  chat-layout.tsx
  conversation-sidebar.tsx
  conversation-item.tsx
  conversation-group.tsx
  starred-section.tsx
  sidebar-navigation.tsx

app/
  page.tsx (updated)
```

## Dependencies
- All required shadcn/ui components already installed
- Uses existing chat components from chatbot kit
- date-fns for date manipulation (already in package.json)
- lucide-react for icons (already in package.json)
- No additional external dependencies needed

## Color System Usage
From `app/globals.css`, we'll use:
- `bg-sidebar` and `text-sidebar-foreground` for sidebar background
- `bg-sidebar-accent` and `text-sidebar-accent-foreground` for hover states
- `border-sidebar-border` for borders and separators
- Existing semantic colors: `bg-background`, `text-foreground`, `text-muted-foreground`

## Testing Approach
- Start with mock data to demonstrate functionality
- Implement responsive behavior testing using browser dev tools
- Verify keyboard navigation and accessibility
- Test sidebar collapse/expand states
- Validate date grouping with various conversation timestamps

## Implementation Order
1. Date utilities and mock data
2. Individual sidebar components (conversation item, navigation)
3. Sidebar composition (groups, starred section, main sidebar)
4. Main chat layout integration
5. Update main page
6. Testing and refinement