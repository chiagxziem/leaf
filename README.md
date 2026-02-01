# Leaf

Leaf is a WYSIWYG note taking web app that allows you to create, update, and organize your notes.

## Features

- Create, update, organize, and retrieve your notes.
- Organize notes into folders.
- Access your notes from any device with an internet connection.

## Tech Stack

- **Runtime:** Bun
- **Frontend Framework:** TanStack Start
- **Backend Framework:** Hono
- **Database:** Postgres
- **Deployment:** Docker

Other tools used include Drizzle as the ORM layer for the database, [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting & [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting.

## Live Demo

- [App URL](https://leaf.gozman.xyz)
- [OpenAPI Docs with Scalar](https://api.leaf.gozman.xyz/api/reference)

## Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/)

## Getting Started

1. **Install dependencies:**

   ```sh
   bun install
   ```

2. **Set up the database:**
   - Create a `.env` file in `packages/db` and enter the DB URL:

     ```env
     DATABASE_URL=postgresql://user:secret@localhost:5432/leaf
     ```

   - The database can be created using `turbo db:up`. Make sure you have Docker set up on your machine. It can be taken down using `turbo db:down`, and deleted using `turbo db:delete`.

   - Migrate the database using the following commands:

     ```sh
     turbo db:generate
     turbo db:migrate
     ```

3. **Set up the backend app:**
   - Copy `.env.example` to `.env` in the `apps/api` directory.
   - Update the values to set up the environment variables. The required variables include:
     - `API_URL`: The URL of the backend app (e.g., `http://localhost:8000`).
     - `WEB_URL`: The URL of the frontend app (e.g., `http://localhost:3000`).
     - `DOMAIN`: The domain of the app (e.g., `localhost:8000`).
     - `DATABASE_URL`: The same DB URL as the one set in the db package.
     - `BETTER_AUTH_SECRET`: A secret key for Better Auth. Generate a new secret using the command: `openssl rand -hex 32`.
     - `GOOGLE_CLIENT_ID`: Your Google Client ID for Google Auth.
     - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret for Google Auth.
     - `ENCRYPTION_KEY`: A secret key for encrypting notes. Generate a new secret using the command: `openssl rand -hex 32`.
     - `CORS_ORIGINS`: Comma-separated list of allowed CORS origins (e.g., `http://localhost:3120,https://app.example.com`).

4. **Set up the frontend app:**
   - Copy `.env.example` to `.env` in the `apps/web` directory.
   - Update the values to set up the environment variables. The required variables include:
     - `WEB_URL`: The URL of the frontend app (e.g., `http://localhost:3000`).
     - `API_URL`: The URL of the backend app (e.g., `http://localhost:8000`).
     - `DATABASE_URL`: The same DB URL as the one set in the database package.
     - `VITE_AUTH_SERVER_URL`: The URL of the backend app (e.g., `http://localhost:8000`).
     - `VITE_BASE_URL`: The URL of the frontend app (e.g., `http://localhost:3000`).

## Running Locally

- Start the dev servers for the various apps and services using:

  ```sh
  turbo dev
  ```

  This will also start up the DB.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear, concise messages.
4. Submit a pull request.

## Roadmap

These are features that I might add later on. This is not a promise.

- [ ] Ability to share notes with other users.
- [ ] Make a PWA.
