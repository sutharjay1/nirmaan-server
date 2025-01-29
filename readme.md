# API Documentation

This document provides detailed information about the API endpoints for the Nirmaan Server. The API allows users to register, login, manage cold storage facilities, compartments, and inventory.

## Server URL

The base URL for all API requests is:

```
https://nirmaan-server-9tci.onrender.com/api/
```

## Postman Collection

You can easily import the API collection into Postman to test the endpoints:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://jay000-9914.postman.co/workspace/Jay-Workspace~9c1784f8-edda-4d9f-8a50-baff4eb350b8/collection/32602754-58b25ed9-43fb-4b80-95fa-1a06059b9c6f?action=share&creator=32602754)

---

## User Routes

### Register User

- **Endpoint**: `POST /users/register`
- **Description**: Registers a new user.
- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "phoneNumber": "1234567890",
    "role": "customer"
  }
  ```

- **Response**:

  ```json
  {
    "user": {
      "email": "user@example.com",
      "role": "customer",
      ...
    },
    "token": "jwt-token"
  }
  ```

---

### Verify OTP

- **Endpoint**: `POST /users/verify-email`
- **Authentication**: Requires Bearer Token
- **Request Body**:

  ```json
  {
    "otp": "113155"
  }
  ```

---

### User Login

- **Endpoint**: `POST /users/login`
- **Description**: Authenticates an existing user.
- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

- **Response**:

  ```json
  {
    "user": {
      "email": "user@example.com",
      ...
    },
    "token": "jwt-token"
  }
  ```

---

## Cold Storage Routes

### Register Cold Storage

- **Endpoint**: `POST /cold-storage/register`
- **Authentication**:
  - Requires Authentication
  - Requires `storageAdmin` role
- **Request Body**:

  ```json
  {
    "name": "Cold Storage A",
    "location": {
      "type": "Point",
      "coordinates": [78.9629, 20.5937]
    },
    "address": "123 Street, City",
    "totalCapacity": 1000,
    "availableCapacity": 500,
    "user": {
      "role": "storage"
    }
  }
  ```

- **Response**:

  ```json
  {
    "admin": "679a467ec17ae9144e586d03",
    "name": "Cold Storage A",
    "location": {
      "type": "Point",
      "coordinates": [78.9629, 20.5937]
    },
    "address": "123 Street, City",
    "totalCapacity": 1000,
    "availableCapacity": 500,
    "isApproved": false,
    "_id": "679a4688c17ae9144e586d06",
    "rejectionHistory": [],
    "__v": 0
  }
  ```

---

### Approve Cold Storage

- **Endpoint**: `POST /cold-storage/:id/approve`
- **Authentication**:
  - Requires Authentication
  - Requires `superAdmin` role
- **Request Body**:

  ```json
  {
    "approve": true
  }
  ```

- **Response**:

  ```json
  {
    "location": {
      "type": "Point",
      "coordinates": [78.9629, 20.5937]
    },
    "_id": "679a56f2b1b347f3837be4dc",
    "admin": "679a509c2b1ad9e23ec9155d",
    "name": "Cold Storage A",
    "address": "123 Street, City",
    "totalCapacity": 1000,
    "availableCapacity": 500,
    "isApproved": true,
    "rejectionHistory": [],
    "__v": 0
  }
  ```

---

### Find Nearby Cold Storages

- **Endpoint**: `GET /cold-storage/nearby`
- **Authentication**: Requires Authentication
- **Query Parameters**:
  - `latitude` (float) – User's latitude
  - `longitude` (float) – User's longitude
  - `maxDistance` (optional, default: 10000) – Search radius in meters
- **Response**:

  ```json
  [
    {
      "name": "Cold Storage A",
      "location": {
        "type": "Point",
        "coordinates": [78.9629, 20.5937]
      },
      "isApproved": true
    }
  ]
  ```

---

## Compartment Routes

### Create Compartment

- **Endpoint**: `POST /compartments`
- **Authentication**:
  - Requires Authentication
  - Requires `storageAdmin` role
- **Request Body**:

  ```json
  {
    "coldStorageId": "cold-storage-id",
    "name": "Compartment 1",
    "capacity": 100,
    "temperature": -5,
    "category": "fruits"
  }
  ```

- **Response**:

  ```json
  {
    "name": "Compartment 1",
    "coldStorage": "cold-storage-id",
    "category": "fruits"
  }
  ```

---

## Inventory Routes

### Add Inventory

- **Endpoint**: `POST /inventory`
- **Authentication**:
  - Requires Authentication
  - Requires `customer` role
- **Request Body**:

  ```json
  {
    "compartment": "compartment-id",
    "itemName": "Apples",
    "quantity": 50,
    "category": "fruits",
    "expiryDate": "2025-12-31"
  }
  ```

- **Response**:

  ```json
  {
    "itemName": "Apples",
    "quantity": 50,
    "customer": "customer-id",
    "compartment": "compartment-id"
  }
  ```
