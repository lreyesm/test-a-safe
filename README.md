# Test A-Safe

This project is a monorepo built with **Fastify**, **Prisma**, and **TypeScript**, designed to showcase the creation of a scalable and modular API. The project includes CRUD functionality, file handling, and is ready to work with a PostgreSQL database.

---

## 📂 Project Structure

```plaintext
monorepo/
├── packages/
│   ├── api/             # API logic
│   │   ├── src/
│   │   │   ├── routes/  # Defined routes (CRUD, file uploads)
│   │   │   ├── index.ts # Main server configuration
├── prisma/              # Prisma configuration and schema
├── .env                 # Environment variables (not included in the repository)
└── README.md            # Project documentation
