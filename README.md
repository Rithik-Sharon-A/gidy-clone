# Gidy Clone

A full-stack profile management application built with the MERN stack. The platform enables users to create, manage, and maintain professional profiles with AI-assisted bio generation capabilities.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Gidy Clone provides a comprehensive solution for professional profile management. Key capabilities include user authentication, CRUD operations for profile data, AI-powered bio generation, and a responsive interface with dark mode support.

### Core Features

- JWT-based authentication (registration and login)
- Profile management with full CRUD support
- AI bio generation via OpenRouter API
- Skills, experience, education, and certifications management
- Dynamic profile completion tracking
- Responsive design with Tailwind CSS
- Dark and light theme support
- Modal-based editing interface

---

## Technology Stack

**Frontend**

| Technology | Purpose |
|------------|---------|
| React 19 | User interface |
| Vite 7 | Build tooling |
| Tailwind CSS 4 | Styling |
| React Router DOM | Client-side routing |
| Axios | HTTP client |
| React Toastify | User notifications |

**Backend**

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| OpenRouter API | AI bio generation |

---

## Prerequisites

Before installation, ensure the following are installed:

- Node.js v16 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- OpenRouter API key

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/Rithik-Sharon-A/gidy-clone.git
cd gidy-clone
```

### Backend Setup

```bash
cd server
npm install
```

### Frontend Setup

```bash
cd client
npm install
```

---

## Configuration

### Backend Environment Variables

Create `server/.env` from the example file:

```bash
cd server
cp .env.example .env
```

Configure the following variables in `server/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 5000) | No |
| MONGODB_URI | MongoDB connection string | Yes |
| OPENROUTER_API_KEY | OpenRouter API key for AI features | Yes |
| JWT_SECRET | Secret for JWT token signing | Yes |
| NODE_ENV | Environment (development/production) | No |

### Frontend Environment Variables

Create `client/.env` from the example file:

```bash
cd client
cp .env.example .env
```

Configure the following variable in `client/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API base URL | Yes |

---

## Running the Application

### Development Mode

Start the backend server:

```bash
cd server
npm run dev
```

In a separate terminal, start the frontend development server:

```bash
cd client
npm run dev
```

Access the application at `http://localhost:5173`.

### Production Mode

Build and serve the frontend:

```bash
cd client
npm run build
npm run preview
```

Start the backend:

```bash
cd server
npm start
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user account |
| POST | /api/auth/login | Authenticate user and return JWT |

### Profile (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/profile | Retrieve authenticated user's profile |
| PUT | /api/user/profile | Update authenticated user's profile |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/bio | Generate professional bio from skills and name |

---

## Project Structure

```
gidy-clone/
├── client/                 # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Backend application
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
├── DEPLOYMENT-GUIDE.md
├── MONGODB-ATLAS-SETUP.md
├── PRE-DEPLOYMENT-CHECKLIST.md
└── README.md
```

---

## Security

- Passwords are hashed using bcryptjs before storage
- JWT tokens are used for stateless authentication
- Sensitive configuration is stored in environment variables
- CORS is configured for cross-origin requests
- Protected routes require valid JWT in the Authorization header

---

## Deployment

Recommended deployment configuration:

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Render or Railway |
| Database | MongoDB Atlas |

For detailed deployment instructions, refer to [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md).

---

## Documentation

Additional documentation is available in the following files:

- [Deployment Guide](./DEPLOYMENT-GUIDE.md) - Step-by-step deployment instructions
- [Pre-Deployment Checklist](./PRE-DEPLOYMENT-CHECKLIST.md) - Security and configuration checklist
- [MongoDB Atlas Setup](./MONGODB-ATLAS-SETUP.md) - Database configuration guide

---

## Known Limitations

- Email verification is not implemented
- Password reset functionality is not available
- Refresh token mechanism is not implemented
- Resume and avatar use URL-based storage (no direct file upload)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/feature-name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**Rithik Sharon A**  
rithiksharon.a@gmail.com
