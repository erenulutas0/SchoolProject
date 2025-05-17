Overview
Airlines Automation System is a modern, web-based database management solution designed specifically for airline operations. This application provides an intuitive interface for database administrators and operations staff to interact with airline databases through SQL queries.

Features
Interactive SQL Editor with syntax highlighting and auto-formatting
Database Schema Visualization with hierarchical tree view
SQL File Import for executing complex database scripts
Real-time Query Execution with formatted results display
Support for Common SQL Operations (SELECT, JOIN, GROUP BY, etc.)
Responsive Design for use across desktop and tablet devices
Technologies Used
React 18
Vite
SQL Parser
Treebeard for schema visualization
CodeMirror for SQL editing

Installation
# Clone the repository
git clone https://github.com/yourusername/airlines-automation-system.git

# Navigate to the project directory
cd airlines-automation-system

# Install dependencies
npm install

# Start the development server
npm run dev

Usage
Upload Database File: Click the "+" button in the sidebar to upload your SQL database file
Browse Schema: Use the tree view in the sidebar to explore tables and their structures
Write Queries: Use the SQL editor to write and edit your queries
Execute: Click the "EXECUTE" button to run your query and view results

Query Examples
-- Simple SELECT query
SELECT * FROM flights WHERE departure_date > NOW();

-- Join tables
SELECT f.flight_id, a.aircraft_model, a.registration_number
FROM flights f
JOIN aircrafts a ON f.aircraft_id = a.aircraft_id
WHERE f.destination = 'JFK';

-- Aggregation
SELECT destination, COUNT(*) as flight_count
FROM flights
GROUP BY destination
HAVING COUNT(*) > 5;

Project Structure
airlines/
├── public/
│   └── ... static assets
├── src/
│   ├── components/
│   │   ├── SqlEditor.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ... other components
│   ├── assets/
│   │   └── background.gif
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── package.json