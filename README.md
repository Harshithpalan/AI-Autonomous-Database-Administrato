# AI Autonomous Database Administrator

A Vue 3 + Nuxt 4 web application for MySQL database management with AI-powered query optimization and backup management features.

## Features

- **Database Connection**: Secure connection management for MySQL databases
- **Backup Management**: Create, view, and download database backups
- **Query Optimizer**: AI-powered SQL query analysis with optimization suggestions
- **Execution Plan**: Visual EXPLAIN query analysis with performance insights
- **Dark Theme**: Modern, responsive dark theme design

## Tech Stack

- **Framework**: Vue 3 + Nuxt 4
- **Database**: MySQL (via mysql2 library)
- **Styling**: Custom CSS with responsive design
- **TypeScript**: Full TypeScript support

## Setup

Make sure to install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Usage

1. Open the application in your browser
2. Enter your MySQL database connection details (host, port, username, password, database name)
3. Click "Connect" to establish a connection
4. Once connected, you can:
   - Create and manage backups
   - Write and execute SQL queries
   - Analyze queries for optimization suggestions

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Security Note

⚠️ This application connects directly to MySQL from the client side. For production use, implement proper authentication, use environment variables for credentials, and consider adding a backend API with proper security measures.

## License

MIT
