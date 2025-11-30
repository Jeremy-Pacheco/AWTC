# Backend Dashboard Documentation

## Introduction

The dashboard of the **A Will To Change** backend is an administration interface rendered with **EJS** (Embedded JavaScript) that provides a comprehensive view of all system data. It is designed for administrators to manage and monitor the status of projects, users, categories, reviews, and incidents.

---

## General Dashboard Structure

The dashboard uses a modular architecture based on different **views** that are included dynamically according to the selected section. Navigation is done through a **sidebar** on the left with access to different sections.

### Main Sections

1. **Overview** - General statistics
2. **Projects** - Project management and analysis
3. **Categories** - Category management
4. **Users** - User analysis
5. **Reviews** - Review visualization
6. **Contacts/Incidents** - Reported incident management

---

## Architecture and Components

### File Structure

```
backend/views/
├── header.ejs                # Main header (sidebar + topbar)
├── index.ejs                 # Main dashboard page
├── projects-dashboard.ejs    # Projects view (separate file)
├── categories-dashboard.ejs  # Categories view (separate file)
├── users-dashboard.ejs       # Users view (separate file)
├── incidents-dashboard.ejs   # Incidents view (separate file)
├── login.ejs                 # Login page
└── access-denied.ejs         # Access denied page
```

### Dashboard Structure Updates (v2.0)

**Key Change**: Dashboard views are now **modularly separated** into individual files for better maintainability:

```ejs
<!-- index.ejs now conditionally includes separate dashboard files -->
<% if (currentSection === 'projects') { %>
  <%- include('projects-dashboard', { projects, categories, allUserProjects }) %>
<% } %>

<% if (currentSection === 'categories') { %>
  <%- include('categories-dashboard', { categories, projects, allUserProjects }) %>
<% } %>

<% if (currentSection === 'users') { %>
  <%- include('users-dashboard', { users, projects, projectsPerUser, allUserProjects, usersNumber }) %>
<% } %>

<% if (currentSection === 'contacts') { %>
  <%- include('incidents-dashboard', { contacts }) %>
<% } %>
```

This modular approach provides:
- **Better code organization**
- **Easier maintenance and updates**
- **Reduced complexity in individual files**
- **Simplified debugging and testing**

---

## 1. Header (header.ejs)

### Purpose
Provides the base structure of the dashboard with side navigation and top bar.

### Main Features

#### **Sidebar**
- **Fixed Navigation**: Left side bar with navigation icons
- **Responsive Behavior**: Collapses on mobile devices
- **Expandable**: Allows expand/collapse to show/hide text labels
- **Logo and Title**: Displays AWTC logo and application name
- **Navigation Options**:
  - 📊 Overview
  - 📋 Projects
  - 🏷️ Categories
  - 👥 Users
  - ⭐ Reviews
  - ⚠️ Incidents

#### **Topbar**
- **Location**: Fixed at the top
- **User Avatar**: Shows user profile picture or initial
- **User Dropdown**: Dropdown menu with logout option
- **User Information**: Email and name of logged-in user

#### **Styles and Responsiveness**
```javascript
// Main breakpoints:
- Desktop: Expandable sidebar (280px) or collapsed (80px)
- Tablet: Always collapsed sidebar (80px)
- Mobile: Sidebar hidden except icons
```

### JavaScript Functionalities
```javascript
// Sidebar toggle (desktop only)
const sidebarToggle = () => {
  sidebar.classList.toggle('expanded');
  localStorage.setItem('sidebarExpanded', sidebar.classList.contains('expanded'));
}

// User dropdown
userAvatar.addEventListener('click', (e) => {
  userDropdown.classList.toggle('show');
});
```

---

## 2. Index - Overview (index.ejs)

### Purpose
Main page that displays an executive summary of the system with key statistics and conditionally includes other dashboard sections.

### Structure
The index.ejs file now acts as a **container** that:
1. Includes the header (sidebar + topbar)
2. Displays overview statistics
3. Conditionally includes specific dashboard views based on `currentSection`

### Conditional Section Loading
```ejs
<!-- Overview Section (always available) -->
<% if (currentSection === 'overview') { %>
  <!-- Overview statistics cards -->
<% } %>

<!-- Specific Dashboard Includes -->
<% if (currentSection === 'projects') { %>
  <%- include('projects-dashboard', { projects, categories, allUserProjects }) %>
<% } %>

<% if (currentSection === 'categories') { %>
  <%- include('categories-dashboard', { categories, projects, allUserProjects }) %>
<% } %>

<% if (currentSection === 'users') { %>
  <%- include('users-dashboard', { users, projects, projectsPerUser, allUserProjects, usersNumber }) %>
<% } %>

<% if (currentSection === 'contacts') { %>
  <%- include('incidents-dashboard', { contacts }) %>
<% } %>
```

### Data Requirements

**Global Data** (always passed to index.ejs):
```javascript
{
  shopName: 'A Will To Change',
  currentUser: user,           // Logged-in admin user
  currentSection: 'overview'   // Section identifier
}
```

**Section-Specific Data** (conditionally passed):
```javascript
// Overview & Shared
projectsNumber: projects.length
categories: categories[]
users: users[]
reviews: reviews[]
contacts: contacts[]

// Projects Section
projects: projects[]
allUserProjects: userProjects[]

// Users Section
projectsPerUser: calculatedData[]
usersNumber: users.length

// Incidents Section
contacts: incidents[]
```

### 2.1 Overview Statistics

**Statistics Cards**:

Displays 5 main statistics with icons and numbers:

| Statistic | Variable | Description |
|-----------|----------|-------------|
| 📊 Total Projects | `projectsNumber` | Total number of projects |
| 🏷️ Categories | `categories.length` | Number of categories |
| 👥 Total Users | `users.length` | Number of users |
| ⭐ Reviews | `reviews.length` | Number of reviews |
| ⚠️ Incidents | `contacts.length` | Number of reported incidents |

**Design**:
- Responsive grid with cards that adapt to screen width
- Gradient with corporate yellow color (#F0BB00)
- Hover effect that lifts the card and adds shadow

---

### 2.2 Projects Dashboard

**Location**: `projects-dashboard.ejs` (included in index.ejs)

#### Components

**1. Side Project List**
```
- Scrollable container with max height of 600px
- Displays all projects with:
  - Project name
  - Category
  - Status (Active, Finished, Cancelled)
  - Volunteer counter
- Interactive: allows selecting projects
```

**2. D3.js Charts (4 Visualizations)**

**a) Projects by Status (Donut Chart)**
```javascript
- Type: Donut chart (ring shape)
- Data: Count by status (active, finished, cancelled)
- Colors: Green (#48bb78), Blue (#4299e1), Red (#f56565)
- Center: Shows total projects
- Legend: Below chart with counts
```

**b) Projects Created Monthly (Line Chart)**
```javascript
- Type: Line chart with area under the line
- Period: Last 12 months
- Data: Projects created by month
- Color: Yellow (#F0BB00)
- Features:
  - Interactive points with tooltip
  - Area with gradient
  - Smooth animation on load
```

**c) Projects by Category (Bar Chart)**
```javascript
- Type: Horizontal bar chart
- Data: Projects per category
- Colors: Yellow (#F0BB00) by default
- Features:
  - Value labels on bars
  - Grid background
  - X axis rotated 45 degrees for readability
```

**d) Occupancy & Engagement (Bubble Chart)**
```javascript
- Type: Bubble chart
- X axis: Project capacity
- Y axis: Active volunteers
- Bubble size: Proportional to occupancy
- Colors: Occupancy scale
  - Red (#f56565): Low occupancy < 50%
  - Yellow (#F0BB00): Medium occupancy ~50%
  - Green (#48bb78): High occupancy > 100%
- Tooltip: Shows occupancy percentage
```

**Data Used**:
```javascript
const projectsData = projects || []
const categoriesData = categories || []
const allUserProjects = userProjects || []  // User-project relationship
```

---

### 2.3 Categories Dashboard

**Location**: `categories-dashboard.ejs`

#### Components

**1. Side Categories List**
```
- Container with scroll
- For each category shows:
  - Name
  - Description
  - Inline statistics:
    - Number of projects
    - Number of unique volunteers
- Interactive: clickable (reserved for future features)
```

**2. D3.js Charts (4 Visualizations)**

**a) Categories Usage (Bar Chart)**
```javascript
- Type: Vertical bar chart
- Data: Projects per category
- Color: Yellow (#F0BB00)
- Sorting: By quantity descending
- Features:
  - Only shows categories with projects
  - Value labels on bars
```

**b) Volunteers Distribution (Pie Chart)**
```javascript
- Type: Pie chart (donut)
- Data: Unique volunteers per category
- Colors: Multi-color palette
- Center: Total volunteers
- Legend: With counts per category
- Calculation: Deduplicates volunteers per category
```

**c) Projects Created Trend (Multi-Line Chart)**
```javascript
- Type: Multiple line chart
- Period: Last 7 days
- One line per category (up to 4)
- Colors: Differentiated palette
- Data: Projects created by day and category
- Legend: Category names
```

**d) Category Activity (Scatter/Bubble Chart)**
```javascript
- Type: Scatter plot with bubbles
- X axis: Number of projects
- Y axis: Number of volunteers
- Bubble size: Square root of (projects + volunteers)
- Label: 3-letter abbreviation of name
- Colors: Yellow (#F0BB00) with opacity
```

---

### 2.4 Users Dashboard

**Location**: `users-dashboard.ejs` (separate file, included in index.ejs)

**Main Features**:

**1. Side User List**
```
- Layout: Grid with 6 users per page
- Pagination: Previous/next buttons with page info display
- For each user shows:
  - Name
  - Email
  - Role badge (Admin, Coordinator, Volunteer)
  - Styles differentiated by role
- Interactive: Select user to view their project details
- Highlighting: Selected user is highlighted with yellow border and background
```

**Role Colors**:
```
- Admin: Red (#feb2b2)
- Coordinator: Blue (#bee3f8)
- Volunteer: Green (#c6f6d5)
```

**2. D3.js Charts (4 Visualizations)**

**a) Registrations - 7 Days (Bar Chart)**
```javascript
- Type: Bar chart with grid lines
- Period: Last 7 days
- Data: New users registered per day
- Color: Yellow (#F0BB00)
- Features:
  - Value labels on bars
  - X axis with day names (Mon, Tue, etc.)
  - Grid background for easier reading
  - Animated bars on load
```

**b) Role Distribution (Donut Chart)**
```javascript
- Type: Donut chart (ring-shaped pie)
- Data: Distribution of user roles
- Colors: 
  - Admin: Red (#feb2b2)
  - Coordinator: Blue (#bee3f8)
  - Volunteer: Green (#c6f6d5)
- Center: Total user count
- Legend: Role names with individual counts
- Responsive: Legend adapts to screen size
  - Mobile: Horizontal legend below
  - Tablet: Compact legend
  - Desktop: Normal legend
- Hover: Shows tooltip with role name and percentage
```

**c) User Projects (Circular Progress Indicator)**
```javascript
- Type: Circular progress indicator with metrics
- Triggered when: Clicking on a user in the list
- Shows:
  - Animated circular progress (0-360 degrees)
  - Number of projects enrolled in
  - Comparison with platform average
  - Status badge (Above Average, Average, Below Average)
- Colors:
  - Progress circle: Yellow (#F0BB00)
  - Above average: Green (#48bb78)
  - Average: Yellow (#F0BB00)
  - Below average: Gray (#718096)
- Animation:
  - Circle fills smoothly over 1 second
  - Numbers count up from 0 to actual value
- Default: Shows message "Click on any user" before selection
```

**d) User Activity Trend (Area Chart)**
```javascript
- Type: Area chart with gradient fill
- Period: Last 7 days
- Data: Accumulated total user enrollments per day
- Colors: 
  - Area fill: Yellow with 60% opacity (#F0BB00 with gradient)
  - Line: Yellow (#F0BB00)
  - Dots: Yellow with white stroke
- Features:
  - Animated dashed line that draws on load
  - Gradient under the curve
  - Interactive points with tooltip
  - Shows daily new enrollments + accumulated total
  - Smooth curve interpolation (monotone)
```

---

### 2.5 Reviews Section

**Simple Features**:
```
- Basic review list
- Shows:
  - Review content
  - Date
- Empty state: Message if no reviews
- No separate file: Remains in index.ejs as inline content
```

---

### 2.6 Incidents Dashboard

**Location**: `incidents-dashboard.ejs` (separate file, included in index.ejs)

**Main Features**:

**1. Statistics Cards**
```
Three key metric cards:
- Total Incidents (Yellow #F0BB00) - All reported incidents
- Closed (Green #10b981) - Resolved incidents (read = 1/true)
- Pending (Orange #f59e0b) - Open incidents (read = 0/false)

Each card displays:
- Icon with gradient background
- Large number showing count
- Descriptive label
- Hover effect (lift + shadow)
```

**2. D3.js Charts (4 Visualizations)**

**a) Incidents Created (Bar Chart with Time Filter)**
```javascript
- Type: Bar chart with grid lines
- Filters: 30 Days (default), 7 Days, Today
- Data: Number of incidents created in selected period
- Color: Yellow (#F0BB00)
- Features:
  - Interactive filter buttons
  - Dynamic date formatting based on range
  - Value labels on bars
  - Grid background
  - Date labels on X axis
- Filter Behavior:
  - Active button: Yellow background
  - Inactive buttons: Gray background
  - Charts re-render on button click
```

**b) Incidents Closed (Bar Chart with Time Filter)**
```javascript
- Type: Bar chart with grid lines
- Filters: 30 Days (default), 7 Days, Today
- Data: Number of incidents closed/marked as read in selected period
- Color: Green (#10b981)
- Features: Same as "Incidents Created"
- Uses updatedAt timestamp to determine closure date
```

**c) Status Distribution (Donut Chart)**
```javascript
- Type: Donut chart
- Data: Open vs Closed breakdown
- Colors:
  - Open: Orange (#f59e0b)
  - Closed: Green (#10b981)
- Center: Shows total incident count
- Legend: Below chart with status and count
- Rendering:
  - Only displays categories with data
  - Smooth animation on load
  - Pie slices with white borders
```

**d) Average Response Time (Metrics Dashboard)**
```javascript
- Type: Gauge visualization with metrics
- Calculations:
  - Average response time in hours (closed incidents only)
  - Minimum response time
  - Maximum response time
  - Count of fast incidents (< 24h)
  - Count of slow incidents (>= 48h)
  - Pending vs Closed ratio
- Display: Circular gauge with multiple metric cards
- Uses: createdAt and updatedAt timestamps for calculation
```

**Chart Container Styling**:
```css
- Each chart has a white container with border
- Header with icon and title
- 2-column grid layout (responsive to 1 column on tablet/mobile)
- Charts auto-adjust height and width
- Consistent color scheme (#F0BB00 as primary)
```

---

## 3. Login (login.ejs)

### Purpose
Authentication page to access the dashboard.

### Features
- **Simple Form**: Email and password
- **Frontend Validation**: Required fields
- **Error Message**: Shows authentication errors
- **Style**: Gradient background, centered card
- **Responsive**: Adaptable to all devices
- **Buttons**: Sign In and Back to home

---

## 4. Access Denied (access-denied.ejs)

### Purpose
Page displayed when a user without permissions tries to access the dashboard.

### Features
- **Error Icon**: Shield denied in red
- **Clear Message**: Explanation of denial
- **User Information**: Shows email and current role
- **Actions**: Logout and return to home
- **Styles**: Consistent with overall design

---

## Technologies Used

### Backend
- **EJS**: Template engine
- **Express.js**: Web framework
- **Sequelize**: ORM for data access

### Frontend (Views)
- **D3.js v7**: Data visualization
- **Font Awesome 6.4**: Iconography
- **CSS3**: Styles and animations
- **Vanilla JavaScript**: Interactivity

### CSS Features
- **CSS Grid**: Responsive layouts
- **Flexbox**: Flexible alignment
- **Media Queries**: Breakpoints:
  - Desktop: > 1024px
  - Tablet: 768px - 1024px
  - Mobile: < 768px
  - Extra mobile: < 480px

---

## Color Palette

```javascript
// Main Color
#F0BB00 (Corporate Yellow)

// Grayscale
#1a202c (Dark Gray - text)
#2d3748 (Dark Gray)
#4a5568 (Medium Gray)
#718096 (Light Gray)
#cbd5e0 (Very Light Gray)
#e2e8f0 (Very Light Gray)
#f7fafc (Very Very Light Gray)

// Thematic Colors
#48bb78 (Green - Complete/Success)
#4299e1 (Blue - Information)
#f56565 (Red - Error/Cancelled)
#10b981 (Dark Green)
#f59e0b (Orange - Warning)

// Gradients
Sidebar: linear-gradient(180deg, #B39519 0%, #806B0A 100%)
Login: linear-gradient(135deg, #fff 0%, #F0BB00 100%)
```

---

## Data Flow

### Sending Data from Backend

```javascript
// From the controller (e.g.: session.controller.js)
res.render('index', {
  shopName: 'A Will To Change',
  currentUser: user,
  currentSection: 'overview',
  
  // Overview Data
  projectsNumber: projects.length,
  categories: categories,
  users: users,
  reviews: reviews,
  contacts: contacts,
  
  // Projects Data
  projects: projects,
  allUserProjects: userProjects,
  
  // Users Data
  projectsPerUser: calculateProjectsPerUser(users, userProjects),
  usersNumber: users.length
});
```

### Data Usage in EJS

```ejs
<!-- Simple Access -->
<%= projectsNumber %>

<!-- Conditionals -->
<% if (currentSection === 'projects') { %>
  <!-- Render specific content -->
<% } %>

<!-- Includes -->
<%- include('projects-dashboard', { projects: projects, categories: categories }) %>

<!-- JSON for JavaScript -->
const projectsData = <%- JSON.stringify(projects) %>;
```

---

## Interactive Features

### 1. Sidebar Toggle
```javascript
- Expands/collapses the side bar
- Persists in localStorage
- Disabled on mobile
```

### 2. User Dropdown
```javascript
- Click on avatar opens menu
- Click outside closes menu
- Logout option
```

### 3. User Selection (Users Dashboard)
```javascript
- Click on user selects/deselects
- Updates projects chart
- Visual style changes
```

### 4. Filter Buttons (Incidents)
```javascript
- Buttons: 30 Days, 7 Days, Today
- Updates charts dynamically
- Active state with different style
```

### 5. D3.js Tooltips
```javascript
- Hover on chart elements
- Shows additional information
- Dynamic positioning
```

---

## Animations

### CSS Transitions
```css
/* Sidebar */
width: 0.3s ease

/* Buttons and Cards */
transform: 0.2s ease, box-shadow: 0.2s ease

/* Hover Effects */
transform: translateY(-2px) (lift effect)
```

### D3.js Animations
```javascript
/* Charts */
.transition()
  .duration(800)     // Duration in milliseconds
  .ease(easeCubicOut) // Easing function

/* Bar Charts */
- Bars grow from 0 to final height

/* Line Charts */
- Line draws with dashboard animation

/* Pie Charts */
- Expand gradually from center

/* Tooltips */
- Fade in/out with opacity
```

---

## Responsive Design

### Breakpoints

**Desktop (> 1024px)**
```
- Sidebar: Expandable to 280px or 80px
- Grid: 2 columns for charts
- Legends: Normally visible
```

**Tablet (768px - 1024px)**
```
- Sidebar: Always 80px
- Grid: 1 column for charts
- Topbar: Adjusted
```

**Mobile (< 768px)**
```
- Sidebar: Icons only, no text
- Padding/Margin: Reduced
- Font sizes: Smaller
- Charts: Reduced height (250px)
```

**Extra Mobile (< 480px)**
```
- Charts: Minimum height (220px)
- Cards: Minimum padding
- Text: Highly compressed
```

---

## Maintenance and Scalability

### Modular Structure (v2.0 Update)
- **Each dashboard section is now a separate file** for better organization
- Easy to update independently
- Component reusability improved
- Reduced file complexity
- Easier navigation for developers

### File Organization Benefits
```
Before (v1.0):
- index.ejs: ~2260 lines (contains all dashboards)

After (v2.0):
- index.ejs: ~340 lines (main structure + overview)
- projects-dashboard.ejs: ~846 lines
- categories-dashboard.ejs: ~751 lines
- users-dashboard.ejs: ~983 lines
- incidents-dashboard.ejs: ~1021 lines
```

### Extensibility
```javascript
// To add new section:

// 1. Create new view file: new-dashboard.ejs
// 2. Add navigation link in header.ejs sidebar
// 3. Add data fetching in the controller
// 4. Include condition in index.ejs

// Example in index.ejs:
<% if (currentSection === 'new-dashboard') { %>
  <%- include('new-dashboard', { data: data }) %>
<% } %>

// Example in header.ejs:
<a href="/new-dashboard" class="sidebar-nav-item <%= (currentSection==='new-dashboard') ? 'active' : '' %>">
  <i class="fas fa-icon"></i>
  <span class="sidebar-nav-text">New Dashboard</span>
</a>
```

### Optimizations Performed
- Use of `safeFindAll()` for error handling with fallback to raw SQL
- Lazy loading of D3.js only when dashboard sections are rendered
- localStorage for persisting user sidebar preferences
- Efficient data serialization with `JSON.stringify()`
- Responsive charts that recalculate on window resize

---

## Security

### Authentication
- HTTP-only session
- Authentication middleware required
- Logout available in dropdown

### Authorization
- `isAdmin()` middleware required
- access-denied page for unauthorized users
- Role verified on server

### Sanitization
- EJS escapes by default (with `<%=`)
- Use `<%-` for trusted HTML (use with caution)

---

## Conclusion

The backend dashboard is a comprehensive solution combining:
- **Modern and responsive design**
- **Advanced data visualizations with D3.js**
- **Scalable and maintainable architecture**
- **Interactive features**
- **Security and access control**

It provides administrators with a powerful tool to monitor and manage all aspects of the "A Will To Change" platform.

---

## Recent Updates (v2.0 - November 2025)

### Major Structural Changes

**Modular Architecture Implementation**:
The dashboard has been refactored from a monolithic structure into a modular one:

**Files Separated**:
1. **users-dashboard.ejs** - Now a separate file (was embedded in index.ejs)
2. **incidents-dashboard.ejs** - Now a separate file (was contacts section in index.ejs)

**Benefits of Refactoring**:
- Improved code maintainability
- Easier to locate and modify specific dashboard sections
- Better performance with on-demand rendering
- Simplified debugging and testing
- Cleaner separation of concerns

**Code Pattern**:
All dashboard views now follow a consistent pattern:
```ejs
<!-- D3.js Library import -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- Styles specific to this dashboard -->
<style>
  /* Grid layouts, cards, and responsive design */
</style>

<!-- HTML structure -->
<div class="dashboard-section">
  <!-- List/cards component -->
  <!-- Charts grid -->
</div>

<!-- Data processing and D3.js rendering -->
<script>
  // Data received from EJS as JSON
  const data = <%- JSON.stringify(dataFromBackend) %>;
  
  // Render functions for each chart
  function renderChart1() { ... }
  function renderChart2() { ... }
  
  // Initialize on page load
  renderDashboard();
</script>
```

### Data Flow Improvements

**Controller to View Data Passing**:
```javascript
// Controllers now pass data for each specific section
res.render('index', {
  currentSection: 'projects',  // or 'users', 'categories', 'contacts'
  
  // Conditional data based on section
  projects: projects,
  categories: categories,
  
  // Global data (always included)
  currentUser: user,
  shopName: 'A Will To Change'
});
```

### Responsive Design Consistency

All dashboard views now include standardized responsive breakpoints:
```css
Desktop (> 1024px):   2-column grid for charts
Tablet (768-1024px):  1-column grid for charts
Mobile (< 768px):     Full-width, reduced padding
Mobile (< 480px):     Minimal spacing, reduced chart heights
```

### Performance Metrics

**File Size Comparison**:
- index.ejs: Reduced from ~2260 to ~340 lines (85% reduction)
- Each dashboard: 750-1000 lines (manageable size)
- Total views size: More efficient with separation

**Load Time Impact**:
- Faster page renders due to modular inclusion
- D3.js loaded only for relevant dashboard
- Better browser caching potential