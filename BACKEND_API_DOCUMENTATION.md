# DaSalon Backend API Documentation

> **Complete API Reference for Frontend Integration**  
> Backend: NestJS + MongoDB + AWS S3  
> Version: 0.0.1

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth Module](#auth-module)
  - [Users Module](#users-module)
  - [Posts/Blogs Module](#postsblogs-module)
  - [Menu Module](#menu-module)
  - [Settings Module](#settings-module)
  - [Dashboard Module](#dashboard-module)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [File Uploads](#file-uploads)

---

## 🚀 Quick Start

### Backend Server

```bash
# Development
cd /Users/macbook/Desktop/dasalon/dasalon-backend
npm run start:dev

# Production
npm run build
npm run start:prod
```

**Server runs on:** `http://localhost:4000`  
**API Base URL:** `http://localhost:4000/api`

### Frontend Configuration

Create `.env.local` in your frontend project:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## ⚙️ Base Configuration

### Server Details

| Property | Value |
|----------|-------|
| **Port** | `4000` (configurable via `PORT` env) |
| **API Prefix** | `/api` |
| **CORS Origin** | `http://localhost:3000` (configurable via `FRONTEND_URL` env) |
| **Body Limit** | `10mb` |
| **Credentials** | Enabled |

### CORS Configuration

```javascript
// Allowed Methods
['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

// Credentials
credentials: true
```

### Environment Variables Required

```env
# Database
MONGO_URI=mongodb://localhost:27017/dasalon

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_key

# AWS S3 (for file uploads)
AWS_REGION=ap-south-1
S3_BUCKET=dasalon-blog
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

---

## 🔐 Authentication

### JWT Token-Based Authentication

All protected routes require a JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### User Roles

```typescript
enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  USER = 'user'
}
```

---

## 📡 API Endpoints

### Auth Module

Base Path: `/api/auth`

#### 1. Sign Up

```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1234567890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 2. Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1234567890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 3. Get Current User

```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "_id": "64f1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Users Module

Base Path: `/api/users`

#### 1. Get All Users

```http
GET /api/users
```

**Response:**
```json
{
  "items": [
    {
      "_id": "64f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. Get User by ID

```http
GET /api/users/:id
```

**Response:**
```json
{
  "_id": "64f1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### 3. Create User

```http
POST /api/users
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "author"
}
```

#### 4. Update User

```http
PATCH /api/users/:id
```

**Headers:** `Authorization: Bearer {token}` (Admin or own profile)

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.new@example.com"
}
```

**Authorization Rules:**
- Admins can update any user
- Users can only update their own profile

#### 5. Delete User

```http
DELETE /api/users/:id
```

---

### Posts/Blogs Module

Base Path: `/api/blogs`

#### 1. Get All Posts

```http
GET /api/blogs
GET /api/blogs?menu=beauty
GET /api/blogs?menu=beauty&submenu=hair
```

**Query Parameters:**
- `menu` (optional): Filter by menu slug
- `submenu` (optional): Filter by submenu slug

**Response:**
```json
[
  {
    "_id": "64f1234567890abcdef12345",
    "title": "10 Beauty Tips for Glowing Skin",
    "slug": "10-beauty-tips-glowing-skin",
    "description": "Discover the best beauty tips...",
    "content": "<p>Full HTML content here...</p>",
    "menu": "beauty",
    "submenu": "beauty-tips",
    "thumbnail": "https://dasalon-blog.s3.amazonaws.com/...",
    "authors": ["John Doe", "Jane Smith"],
    "status": "published",
    "tags": ["skincare", "beauty", "tips"],
    "shareUrl": "https://dasalon.com/blog/...",
    "featured": true,
    "images": ["https://...", "https://..."],
    "views": 1250,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
]
```

#### 2. Get Single Post

```http
GET /api/blogs/:id
```

**Response:** Same as single post object above

#### 3. Create Post

```http
POST /api/blogs
```

**Request Body:**
```json
{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "description": "Short description",
  "content": "<p>Full HTML content</p>",
  "menu": "beauty",
  "submenu": "hair",
  "thumbnail": "https://...",
  "authors": ["Author Name"],
  "status": "draft",
  "tags": ["tag1", "tag2"],
  "featured": false
}
```

#### 4. Update Post

```http
PUT /api/blogs/:id
```

**Request Body:** Same as create (partial updates allowed)

#### 5. Delete Post

```http
DELETE /api/blogs/:id
```

---

### Menu Module

Base Path: `/api/menu`

#### 1. Get All Menus (Public)

```http
GET /api/menu/menus
```

**Response:**
```json
[
  {
    "_id": "64f1234567890abcdef12345",
    "name": "BEAUTY",
    "slug": "beauty",
    "description": "All about beauty",
    "status": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 2. Get All Menus with Submenus (Admin)

```http
GET /api/menu/admin/all
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "menu": {
      "_id": "64f1234567890abcdef12345",
      "name": "BEAUTY",
      "slug": "beauty",
      "status": true
    },
    "submenus": [
      {
        "_id": "64f9876543210fedcba98765",
        "name": "beauty tips",
        "slug": "beauty-tips",
        "parent_id": "64f1234567890abcdef12345",
        "status": true
      },
      {
        "_id": "64f9876543210fedcba98766",
        "name": "hair",
        "slug": "hair",
        "parent_id": "64f1234567890abcdef12345",
        "status": true
      }
    ]
  }
]
```

#### 3. Create Menu

```http
POST /api/menu/menus
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "FASHION",
  "slug": "fashion",
  "description": "Fashion and style"
}
```

#### 4. Update Menu

```http
PUT /api/menu/menus/:id
```

**Headers:** `Authorization: Bearer {token}`

#### 5. Delete Menu

```http
DELETE /api/menu/menus/:id
```

**Headers:** `Authorization: Bearer {token}`

> **Note:** Deleting a menu will also delete all its submenus (cascading delete)

#### 6. Create Submenu

```http
POST /api/menu/submenus
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Makeup",
  "slug": "makeup",
  "parent_id": "64f1234567890abcdef12345"
}
```

#### 7. Delete Submenu

```http
DELETE /api/menu/submenus/:id
```

**Headers:** `Authorization: Bearer {token}`

---

### Settings Module

Base Path: `/api/settings`

#### 1. Get Settings

```http
GET /api/settings
```

**Response:**
```json
{
  "_id": "64f1234567890abcdef12345",
  "siteName": "DaSalon Blog",
  "siteDescription": "Your beauty destination",
  "logo": "https://dasalon-blog.s3.amazonaws.com/settings/logo.png",
  "favicon": "https://dasalon-blog.s3.amazonaws.com/settings/favicon.ico",
  "contact": {
    "email": "info@dasalon.com",
    "phone": "+1234567890",
    "address": "123 Beauty Street"
  },
  "social": {
    "facebook": "https://facebook.com/dasalon",
    "twitter": "https://twitter.com/dasalon",
    "instagram": "https://instagram.com/dasalon",
    "linkedin": "https://linkedin.com/company/dasalon"
  },
  "seo": {
    "metaTitle": "DaSalon - Beauty Blog",
    "metaDescription": "Discover beauty tips and trends",
    "keywords": ["beauty", "fashion", "lifestyle"]
  },
  "theme": "light",
  "postsPerPage": 10
}
```

#### 2. Get Settings by ID

```http
GET /api/settings/:id
```

#### 3. Create Settings

```http
POST /api/settings
```

**Headers:** `Authorization: Bearer {token}` (Admin only)

**Request Body:** Same structure as GET response

#### 4. Update Settings

```http
PUT /api/settings/:id
```

**Headers:** `Authorization: Bearer {token}` (Admin only)

#### 5. Upload File to S3

```http
POST /api/settings/upload
```

**Headers:** 
- `Authorization: Bearer {token}` (Admin only)
- `Content-Type: multipart/form-data`

**Request Body:**
```
FormData with 'file' field
```

**Response:**
```json
{
  "url": "https://dasalon-blog.s3.ap-south-1.amazonaws.com/settings/logo-1234567890.png",
  "message": "File uploaded successfully to AWS S3"
}
```

---

### Dashboard Module

Base Path: `/api`

#### Get Dashboard Statistics

```http
GET /api/dashboard-stats
```

**Response:**
```json
{
  "totalPosts": 45,
  "totalCategories": 8,
  "totalUsers": 12,
  "totalViews": 15420
}
```

---

## 📊 Data Models

### User Schema

```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  role: 'admin' | 'author' | 'user',
  createdAt: Date,
  updatedAt: Date
}
```

### Post Schema

```typescript
{
  _id: ObjectId,
  title: string (required),
  slug: string,
  description: string,
  content: string (HTML),
  menu: string (required),
  submenu: string,
  thumbnail: string,
  authors: string[],
  status: string,
  tags: string[],
  shareUrl: string,
  featured: boolean,
  images: string[],
  views: number (default: 0),
  createdAt: string,
  updatedAt: string
}
```

### Menu Schema

```typescript
{
  _id: ObjectId,
  name: string (required),
  slug: string (unique, lowercase),
  description: string,
  status: boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Submenu Schema

```typescript
{
  _id: ObjectId,
  name: string (required),
  slug: string (unique, lowercase),
  parent_id: ObjectId (references Menu),
  description: string,
  status: boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Settings Schema

```typescript
{
  _id: ObjectId,
  siteName: string,
  siteDescription: string,
  logo: string,
  favicon: string,
  contact: {
    email: string,
    phone: string,
    address: string
  },
  social: {
    facebook: string,
    twitter: string,
    instagram: string,
    linkedin: string
  },
  seo: {
    metaTitle: string,
    metaDescription: string,
    keywords: string[]
  },
  theme: 'light' | 'dark' | 'system',
  postsPerPage: number,
  lastEditedBy: string,
  history: Array,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (e.g., duplicate email) |
| `500` | Internal Server Error |

### Common Errors

**Unauthorized Access:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password should not be empty"],
  "error": "Bad Request"
}
```

**Duplicate Email:**
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

---

## 📤 File Uploads

### AWS S3 Integration

The backend uses AWS S3 for file storage. All uploaded files are stored in the `dasalon-blog` bucket.

### Upload Endpoint

```http
POST /api/settings/upload
```

**Request:**
```javascript
const formData = new FormData();
formData.append('file', fileObject);

fetch('http://localhost:4000/api/settings/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "url": "https://dasalon-blog.s3.ap-south-1.amazonaws.com/settings/file-123456.png",
  "message": "File uploaded successfully to AWS S3"
}
```

### Supported File Types

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Documents: `.pdf`
- Max file size: `10MB`

---

## 🔧 Frontend Integration Example

### API Client Setup

```javascript
// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
}

// Example usage
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  signup: (userData) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getCurrentUser: () => apiCall('/auth/me'),
};

export const blogsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/blogs?${params}`);
  },
  
  getById: (id) => apiCall(`/blogs/${id}`),
  
  create: (postData) => apiCall('/blogs', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),
  
  update: (id, postData) => apiCall(`/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  }),
  
  delete: (id) => apiCall(`/blogs/${id}`, {
    method: 'DELETE',
  }),
};
```

### Authentication Flow

```javascript
// Login example
async function handleLogin(email, password) {
  try {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

// Protected route check
async function checkAuth() {
  try {
    const user = await authAPI.getCurrentUser();
    return user;
  } catch (error) {
    // Redirect to login
    localStorage.removeItem('token');
    return null;
  }
}
```

---

## 📝 Additional Resources

- [Menu API Guide](./MENU_API_GUIDE.md) - Detailed menu management documentation
- [S3 Migration Guide](./S3-MIGRATION.md) - AWS S3 setup and troubleshooting

---

## 🆘 Support

For issues or questions:
1. Check the error response for specific details
2. Verify JWT token is valid and not expired
3. Ensure all required environment variables are set
4. Check MongoDB connection status
5. Verify AWS S3 credentials (for file uploads)

---

**Last Updated:** 2024-01-26  
**Backend Version:** 0.0.1  
**Maintained by:** DaSalon Development Team
