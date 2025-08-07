# Recipe API

A Node.js Express application for managing recipes and ingredients, featuring GitHub OAuth authentication and interactive API documentation via Swagger.

## Features

*   **MVC Architecture:** Organized codebase following the Model-View-Controller pattern.
*   **RESTful API:** Provides endpoints for CRUD (Create, Read, Update, Delete) operations on recipes and ingredients.
*   **GitHub Authentication:** Secure user login using OAuth 2.0 via GitHub. Sessions are managed using `express-session` and stored in MongoDB via `connect-mongo`.
*   **Swagger Documentation:** Interactive API documentation available for exploring and testing endpoints.
*   **MongoDB Integration:** Uses Mongoose ODM for data modeling and interaction with a MongoDB database.

## Project Structure

```
.
├── controllers/        # Request handling logic (business logic)
├── middleware/         # Custom middleware functions (e.g., authentication checks)
├── models/             # Mongoose schemas defining data structures
├── public/             # Static frontend files (HTML, CSS, client-side JS)
├── routes/             # API route definitions
├── .env                # Environment variables (requires creation)
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Records exact versions of dependencies
├── server.js           # Main application entry point, server setup
├── swagger.js          # Swagger configuration and setup
└── README.md           # This file
```

## Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud-based like MongoDB Atlas)
*   A [GitHub Account](https://github.com/)
*   A [GitHub OAuth Application](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) configured with the correct callback URL.

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create Environment File:**
    Create a `.env` file in the root directory of the project.

## Environment Variables

Copy the following variables into your `.env` file and replace the placeholder values with your actual credentials and settings:

```dotenv
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/recipe_db # Or your MongoDB Atlas connection string

# Session Secret (replace with a long, random string)
SESSION_SECRET=your_very_secret_key_here

# GitHub OAuth Application Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback # Ensure this matches your GitHub OAuth App settings

# Server Port (Optional, defaults to 3000)
PORT=3000
```

**Important:**
*   Ensure the `GITHUB_CALLBACK_URL` in your `.env` file exactly matches the "Authorization callback URL" configured in your GitHub OAuth App settings.
*   Keep your `.env` file secure and do not commit it to version control (it's included in `.gitignore`).

## Running the Application

1.  **Start the server:**
    ```bash
    npm start
    ```
    This command typically uses `nodemon` (if configured in `package.json`) for automatic restarts during development. Alternatively, you can run `node server.js`.

2.  The server should start, and you'll see output indicating it's running on the specified port (default 3000) and connected to MongoDB.

## API Endpoints

The application provides the following main API routes:

*   `/api/ingredients`: CRUD operations for ingredients.
*   `/api/recipes`: CRUD operations for recipes.
*   `/auth`: Handles GitHub authentication (`/auth/github`, `/auth/github/callback`, `/auth/logout`).
*   `/api/user/me`: Gets the currently logged-in user's information.

For detailed information on request/response formats and parameters, please refer to the Swagger documentation.

## Authentication

Authentication is handled via GitHub OAuth 2.0:

1.  Accessing a protected route or clicking the "Login with GitHub" link on the homepage redirects the user to GitHub.
2.  The user logs into GitHub (if not already logged in) and authorizes the application.
3.  GitHub redirects the user back to the application's callback URL (`/auth/github/callback`).
4.  The application verifies the user, establishes a session, and sets a session cookie in the user's browser.
5.  Subsequent requests to protected routes are authenticated using this session cookie.
6.  Users can log out via the `/auth/logout` endpoint.

## Swagger Documentation

Interactive API documentation is available when the server is running:

*   Navigate to `/api-docs` in your browser (e.g., `http://localhost:3000/api-docs`).
*   You can view all available endpoints, see expected request/response schemas, and test the API directly from the Swagger UI. Note that endpoints requiring authentication need a valid session cookie (obtained by logging in first).
