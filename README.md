# PulseAPI

PulseAPI is a backend service built with raw Node.js for monitoring the uptime and downtime of websites and APIs. It provides real-time insights into service availability, helping developers and businesses ensure reliability and respond quickly to outages.

## Features

- User registration and authentication (token-based)
- Secure password hashing
- User login/logout with tokens
- Blacklist mechanism for tokens (logout)
- CRUD operations for users
- Route-based request handling
- Cookie parsing and management
- Modular code structure for scalability

## Project Structure

```
pulseapi/
├── index.js                        # Application entry point
├── collections/
│   ├── blackListTokenCollection.js   # A database collection for handling black listed token
│   ├── tokenCollection.js            # A database collection for handling token
│   └── userCollection                # A database collection for handling users
├── controllers/
│   ├── serverControllers.js          # Controller logic for server APIs
│   └── userControllers.js            # Controller logic for user APIs
├── env/
│   └── environment.js                # Environment veriable for the application (e.g. SECRET, PORT)
├── helpers/
│   ├── requestResponseHandler.js     # The http request and response handler for the application
│   └── README.md                     # The http request and response handler for the application
├── lib/
│   ├── my-db/                        # A custom database library for CRUD operation
│   │   ├── collection.js
│   │   ├── db.js
│   │   ├── index.js
│   │   └── README.md
│   └── my-token/                     # A custom JWT like library for token sign & verify methods
│       ├── mytoken.js
│       └── README.md
├── routes/
│   └── routes.js                     # All available routes
├── middleware/
│   └── my-cookie-parser /            # My Custom cookie-parser for parsing http cookies
│       ├── my-cookie-parser.js       
│       └── README.md                 
├── utilities/
│   ├── generatehash.js               # Custom utility logic for generating a hashed string
│   ├── parsejson.js                  # Custom utility logic for parsing valid JSON data
│   ├── index.js                      # Entry point for the utility modules
│   └── README.md                     
├── README.md                       # Project documentation
└── package.json                    # Project metadata & dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)

### Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd pulse-api
```

2. Run developement server

```bash
cd pulse-api
npm run dev
```

# User API Endpoints Documentation

This document describes the user-related API endpoints provided by PulseAPI. These endpoints allow clients to register, log in, fetch user profiles, and log out securely using token-based authentication.

---

## Endpoints Overview

| Method | Path              | Description                   | Auth Required |
| ------ | ----------------- | ----------------------------- | ------------- |
| POST   | `/users/register` | Register a new user           | No            |
| POST   | `/users/login`    | Login an existing user        | No            |
| GET    | `/users/profile`  | Get user profile              | Yes           |
| GET    | `/users/logout`   | Logout user (blacklist token) | Yes           |

---

## 1. Register User

**Endpoint:** `POST /users/register`  
**Description:** Registers a new user and returns a token.

### Request Body

| Field    | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| name     | String | Yes      | Full name of the user |
| email    | String | Yes      | Email address         |
| phone    | String | Yes      | Phone number          |
| password | String | Yes      | Password              |

### Success Response

- **201 Created**
  ```json
  {
    "success": true,
    "message": "New user created successfully",
    "user": {
      "email": "<user email>",
      "phone": "<user phone>",
      "name": "<user name>",
      "password": null
    },
    "token": "<JWT-like token>"
  }
  ```

### Error Responses

- **400 Bad Request**
  ```json
  {
    "success": false,
    "message": "Missing required fields"
  }
  ```
- **409 Conflict**
  ```json
  {
    "success": false,
    "message": "User already exists"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
    "success": false,
    "message": "Could not create user"
  }
  ```

---

## 2. Login User

**Endpoint:** `POST /users/login`  
**Description:** Authenticates a user and returns a token.

### Request Body

| Field    | Type   | Required | Description  |
| -------- | ------ | -------- | ------------ |
| phone    | String | Yes      | Phone number |
| password | String | Yes      | Password     |

### Success Response

- **200 OK**
  ```json
  {
    "success": true,
    "message": "User login successful",
    "user": {
      "email": "<user email>",
      "phone": "<user phone>",
      "name": "<user name>",
      "password": null
    },
    "token": "<JWT-like token>"
  }
  ```

### Error Responses

- **400 Bad Request**
  ```json
  {
    "success": false,
    "message": "Missing required fields"
  }
  ```
- **401 Unauthorized**
  ```json
  {
    "success": false,
    "message": "Invalid phone or password"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
    "success": false,
    "message": "Could not login user"
  }
  ```

---

## 3. Get User Profile

**Endpoint:** `GET /users/profile`  
**Description:** Fetches the profile of an authenticated user.

### Query Parameters

| Field | Type   | Required | Description   |
| ----- | ------ | -------- | ------------- |
| email | String | Yes      | Email address |
| phone | String | Yes      | Phone number  |

### Authentication

- Requires a valid token in cookies or `Authorization` header.

### Success Response

- **200 OK**
  ```json
  {
    "success": true,
    "message": "User profile fetched successfully",
    "user": {
      "email": "<user email>",
      "phone": "<user phone>",
      "name": "<user name>",
      "password": null
    }
  }
  ```

### Error Responses

- **400 Bad Request**
  ```json
  {
    "success": false,
    "message": "Missing required fields"
  }
  ```
- **401 Unauthorized**
  ```json
  {
    "success": false,
    "message": "Authentication required"
  }
  ```
- **403 Forbidden**
  ```json
  {
    "success": false,
    "message": "Invalid or expired token"
  }
  ```
- **404 Not Found**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
    "success": false,
    "message": "Could not fetch user profile"
  }
  ```

---

## 4. Logout User

**Endpoint:** `GET /users/logout`  
**Description:** Logs out the user by blacklisting the token.

### Query Parameters

| Field | Type   | Required | Description   |
| ----- | ------ | -------- | ------------- |
| email | String | Yes      | Email address |
| phone | String | Yes      | Phone number  |

### Authentication

- Requires a valid token in cookies or `Authorization` header.

### Success Response

- **200 OK**
  ```json
  {
    "success": true,
    "message": "User logout successfully",
    "token": "<JWT-like token>"
  }
  ```

### Error Responses

- **400 Bad Request**
  ```json
  {
    "success": false,
    "message": "Missing required fields"
  }
  ```
- **401 Unauthorized**
  ```json
  {
    "success": false,
    "message": "Authentication required"
  }
  ```
- **403 Forbidden**
  ```json
  {
    "success": false,
    "message": "Invalid or expired token"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
    "success": false,
    "message": "Could not logout user"
  }
  ```

---

## Notes

- All responses are in JSON format.
- Passwords are never returned in responses.
- Token is cleared from the HTTP-only cookies for security.
- Token is black listed
- Blacklisted tokens cannot be reused for authentication.

---

============

## **`POST /users/register` - Register user API Endpoint**

An API to create a new user in the system

**URL Endpoint:** `/users/register`
**Method:** `POST`
**Authentication Required:** No, Public Endpoint
**content-type:** `application/json`

### Request Body

| Field      | Type   | Required | Description                          |
| ---------- | ------ | -------- | ------------------------------------ |
| `name`     | String | Yes      | Full name of the user                |
| `email`    | String | Yes      | User email (must be unique)          |
| `phone`    | String | Yes      | User phone number (must be unique)   |
| `password` | String | Yes      | Raw password (hashed before storing) |

**Example**

```json
{
  "name": "Omar Bin Saleh",
  "email": "omar@example.com",
  "phone": "+880123456789",
  "password": "StrongPassword123!"
}
```

### ✅ Success Response (201 Created)

```json
{
  "success": true,
  "message": "New user created successfully",
  "user": {
    "_id": "9f7c3c41-dbb1-49e8-9e64-d84d9ff0d77a",
    "name": "Omar Bin Saleh",
    "email": "omar@example.com",
    "phone": "+880123456789"
  },
  "token": "<JWT_TOKEN>"
}
```

### Response Header

The server also sets an authentication token in the cookies

```jsx
res.setHeader("Set-Cookie: token=<JWT_Token>; HttpOnly; path=/; Max-Age=3600");
```

- `HttpOnly`: Cookie is not accessible vai JavaScript (XSS protection);
- `path=/`: Cookie is sent from all routes
- `Max-Age=3600`: Token expires in 1 hours

### Error Response

#### **Missing Fields (400)**

```json
{
  "success": false,
  "message": "All fields are required"
}
```

#### **Duplicate User (400)**

```json
{
  "success": false,
  "message": "User with this email/phone already exists"
}
```

#### **Invalid Request / Other Errors (400)**

```json
{
  "success": false,
  "message": "Invalid request"
}
```
