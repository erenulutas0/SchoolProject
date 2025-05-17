# Airlines Automation System
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## Overview
A modern, web-based database management solution designed specifically for airline operations. This application provides an intuitive interface for database administrators and operations staff to interact with airline databases through SQL queries, with specific support for PostgreSQL syntax and features. The system leverages PostgreSQL's robust querying capabilities, including its advanced functions and operators, to enable comprehensive airline data management.

## Features
- Interactive SQL Editor with syntax highlighting and auto-formatting  
- Database Schema Visualization with hierarchical tree view  
- SQL File Import functionality  
- Real-time Query Execution with formatted results display  
- Support for common SQL Operations (SELECT, JOIN, GROUP BY, etc.)  
- Support for aggregate functions (COUNT, SUM, AVG, MIN, MAX)  
- Advanced filtering with WHERE and HAVING clauses  
- String functions (UPPER, LOWER)  
- Date handling and formatting  
- Responsive design for desktop and tablet devices  

## Installation Requirements

To install the required packages for this project, run the following commands:

```bash
# Core packages
npm install react@18.2.0 react-dom@18.2.0

# CodeMirror editor and SQL support
npm install codemirror@6.0.1 @codemirror/lang-sql@6.8.0

# Tree visualization for database schema
npm install react-treebeard@3.2.4

# Development environment
npm install vite@6.3.5 --save-dev
```

## Installation

```bash
# Clone the repository
git clone https://github.com/erenulutas0/SchoolProject.git

# Install dependencies
npm install

# Start the development server
npm run dev
```


# Usage
Upload your SQL database file using the "+" button in the sidebar
Browse schema tree view to explore tables and their structures
Write SQL queries in the editor
Click "EXECUTE" to run your query and view results


# Contributors
-Eren Ulutas  
-Emre Kılıc  