# Data Reader

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up your MongoDB connection:
   - By default, the app connects to `mongodb://localhost:27017/data-reader`.
   - To use a different URI, set the `MONGO_URI` environment variable.

## Running the Project (Development)

Start the project with hot-reloading:

```bash
npm start
```

## Building the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Migrations

Migrations are managed with [migrate-mongo](https://github.com/seppevs/migrate-mongo).

- **Create a new migration:**

  ```bash
  npm run migrate:create <migration-name>
  ```

  This creates a new migration file in `src/migrations/`.

- **Run migrations (up):**

  ```bash
  npm run migrate:up
  ```

- **Revert last migration (down):**
  ```bash
  npm run migrate:down
  ```

## Project Structure

- `src/models/` — Mongoose models
- `src/migrations/` — Migration scripts
- `src/db.ts` — MongoDB connection logic
- `src/index.ts` — Project entry point
