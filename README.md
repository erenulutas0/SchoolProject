Airlines Automation System
Overview
A modern, web-based database management solution designed specifically for airline operations. This application provides an intuitive interface for database administrators and operations staff to interact with airline databases through SQL queries.

Features
Interactive SQL Editor with syntax highlighting and auto-formatting
Database Schema Visualization with hierarchical tree view
SQL File Import functionality
Real-time Query Execution with formatted results display
Support for common SQL Operations (SELECT, JOIN, GROUP BY, etc.)
Support for aggregate functions (COUNT, SUM, AVG, MIN, MAX)
Advanced filtering with WHERE and HAVING clauses
String functions (UPPER, LOWER)
Date handling and formatting
Responsive design for desktop and tablet devices
# Clone the repository
git clone https://github.com/erenulutas0/SchoolProject.git

# Navigate to project directory
cd SchoolProject

# Install dependencies
npm install

# Start the development server
npm run dev
Usage
Upload your SQL database file using the "+" button in the sidebar
Browse schema tree view to explore tables and their structures
Write SQL queries in the editor
Click "EXECUTE" to run your query and view results
Example Queries
-- Simple SELECT query
SELECT * FROM flights WHERE departure_date > NOW();

-- Join tables
SELECT f.flight_id, a.aircraft_model, a.registration_number 
FROM flights f JOIN aircrafts a ON f.aircraft_id = a.aircraft_id 
WHERE f.destination = 'JFK';

-- Aggregation
SELECT destination, COUNT(*) as flight_count 
FROM flights GROUP BY destination 
HAVING COUNT(*) > 5;

-- Date functions
SELECT DATE(booking_time) as booking_date, COUNT(*) as bookings
FROM bookings
GROUP BY booking_date
ORDER BY booking_date DESC;
Technologies Used
React
SQL Parser
TreeBeard for schema visualization
CodeMirror for SQL editing
CSS for responsive design
Project Structure
The application follows a component-based architecture with separate modules for SQL editing, schema visualization, and results display.

Contributors
Eren Ulutaş