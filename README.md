*
# Test-A-Safe API

Test-A-Safe is a Node.js and Fastify-based API designed to manage authentications, users, messages, and more, organized within a monorepo for a modular and scalable structure.

## Prerequisites

- Node.js >= 14.x
- npm or Yarn
- Configured PostgreSQL database
- Prisma CLI for schema management

## Setup

1. **Clone the repository**:
  ```bash
  git clone https://github.com/your-repo/test-a-safe.git
  cd test-a-safe
  ```

2. **Install dependencies**:
  Use npm or Yarn according to the project setup:
  ```bash
  yarn install
  ```

3. **Configure environment variables**:
  Create a `.env` file at the root of the project with the following content:
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/db_name
  PORT=3000
  JWT_SECRET=your_secret_key
  REST_SERVER_URL=http://localhost
  WS_SERVER_URL=ws://localhost:3000/ws
  NODE_ENV=development
  ```

4. **Configure test environment variables**:
  Create a `.env.test` file at the root of the project with the following content:
  ```env.test
  DATABASE_URL=postgresql://user:password@localhost:5432/db_name
  PORT=3000
  JWT_SECRET=your_secret_key
  REST_SERVER_URL=http://localhost
  WS_SERVER_URL=ws://localhost:3000/ws
  NODE_ENV=development
  ```

5. **Migrate the database**:
  Run Prisma migrations:
  ```bash
  npx prisma migrate dev
  ```

6. **Start the server**:
  ```bash
  yarn start
  ```

## Endpoints

### **Auth**

- **Admin Login**: 
  ```http
  POST /auth/login
  ```
  **Body**:
  ```json
  {
   "email": "admin@example.com",
   "password": "12345678"
  }
  ```

- **User Login**:
  ```http
  POST /auth/login
  ```
  **Body**:
  ```json
  {
   "email": "user@example.com",
   "password": "12345678"
  }
  ```

- **Protected Endpoint**:
  ```http
  GET /auth/protected
  ```
  **Headers**:
  ```json
  {
   "Authorization": "Bearer <token>"
  }
  ```

### **Users**

- **Get all users**:
  ```http
  GET /users
  ```
  **Headers**:
  ```json
  {
   "Authorization": "Bearer <token>"
  }
  ```

- **Update a user**:
  ```http
  PUT /users/:id
  ```
  **Body**:
  ```json
  {
   "name": "New Name"
  }
  ```

### **Messages**

- **Send a message**:
  ```http
  POST /messages
  ```
  **Body**:
  ```json
  {
   "content": "Hello, how are you?",
   "receiverId": 2
  }
  ```

- **Get a conversation**:
  ```http
  GET /messages/:receiverId
  ```

### **File Uploads**

- **Upload profile picture**:
  ```http
  POST /upload/profile-picture
  ```
  **Headers**:
  ```json
  {
   "Authorization": "Bearer <token>"
  }
  ```
  **Body**:
  - Form-data with key `file`.

### **Admin**

- **Register a new user**:
  ```http
  POST /admin/register
  ```
  **Body**:
  ```json
  {
   "name": "New User",
   "email": "new.user@example.com",
   "password": "12345678",
   "role": "user"
  }
  ```

- **Admin Dashboard**:
  ```http
  GET /admin/dashboard
  ```

## Project Structure

The project follows a modular approach using a monorepo organized in `packages`:

```
monorepo/
├── packages/
│   ├── api/                 # Main API logic
│   │   ├── src/
│   │   │   ├── plugins/     # Fastify plugins and custom extensions
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── schemas/     # JSON schemas for request/response validation
│   │   │   ├── services/    # Business logic (to interact with the database, etc.)
│   │   │   ├── types/       # TypeScript types and interfaces
│   │   │   ├── utils/       # Shared utility functions
│   │   │   ├── index.ts     # Fastify server configuration and setup
├── prisma/                  # Prisma ORM configuration and database schema
│   ├── migrations/          # Prisma migration files
│   ├── data.sql             # SQL scripts to seed initial data
│   ├── schema.prisma        # Prisma schema definition
├── test/                    # Test suite for the application
│   ├── files/               # Tests for file operations (uploads/downloads)
│   ├── routes/              # Tests for API routes
│   ├── services/            # Tests for service layer (business logic)
│   ├── utils/               # Tests for utility functions
│   ├── setup.ts             # Test environment setup (e.g., mock server, test DB)
│   ├── teardown.ts          # Test teardown logic (cleaning up resources)
├── uploads/                 # Directory for uploaded files (if applicable)
├── .env                     # Environment variables (excluded from repository)
├── package.json             # Root package configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation


```

## Available Scripts

- **Build the project**:
  ```bash
  yarn build
  ```

- **Run tests**:
  ```bash
  yarn test
  ```

- **Start the server**:
  ```bash
  yarn start
  ```

## Contributing

1. Fork the project.
2. Create your feature branch:
  ```bash
  git checkout -b feature/new-feature
  ```
3. Make your changes and commit them:
  ```bash
  git commit -m "Add new feature"
  ```
4. Push your changes:
  ```bash
  git push origin feature/new-feature
  ```
5. Submit a pull request.

---
*