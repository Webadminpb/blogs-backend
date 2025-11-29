# 📘 API Reference & Changes

This document lists all **new** and **updated** API endpoints implemented for the frontend integration.

## 🚨 Breaking Changes

### 1. Authentication
**Status**: 🔄 Updated Response
- **Endpoints**: `POST /api/auth/login`, `POST /api/auth/signup`
- **Change**: Response now returns `access_token` instead of `token`.
- **Response**:
  ```json
  {
    "message": "Login successful",
    "access_token": "eyJhbG...",
    "user": { ... }
  }
  ```

---

## 🆕 New Endpoints

### 2. General File Upload
**Status**: ✅ New
- **Endpoint**: `POST /api/upload`
- **Auth**: Required (`Authorization: Bearer <token>`)
- **Query Param**: `?folder=folder_name` (optional, e.g., `blog-images`, `avatars`)
- **Body**: `multipart/form-data` with field `file`.
- **Response**:
  ```json
  {
    "url": "https://s3-bucket-url.com/folder/image.jpg",
    "public_id": "folder/image"
  }
  ```

### 3. Blog by Slug
**Status**: ✅ New
- **Endpoint**: `GET /api/blogs/slug/:slug`
- **Auth**: Public
- **Description**: Fetch a single blog post by its SEO-friendly slug.

### 4. Increment Blog Views
**Status**: ✅ New
- **Endpoint**: `POST /api/blogs/:id/view`
- **Auth**: Public
- **Description**: Call this when a user visits a blog post to increment the view counter.

### 5. User Avatar Upload
**Status**: ✅ New
- **Endpoint**: `POST /api/users/:id/avatar`
- **Auth**: Required (User can upload their own, Admin can upload for anyone)
- **Body**: `multipart/form-data` with field `file`.
- **Response**:
  ```json
  {
    "url": "https://s3-bucket-url.com/avatars/image.jpg",
    "message": "Avatar uploaded successfully"
  }
  ```

---

## 🔄 Updated Endpoints

### 6. Menu Admin Response
**Status**: 🔄 Updated Format
- **Endpoint**: `GET /api/menu/admin/all`
- **Auth**: Admin only
- **Change**: Each item is now wrapped in a `menu` object.
- **Response**:
  ```json
  [
    {
      "menu": { "_id": "...", "name": "Beauty", ... },
      "submenus": [ ... ]
    }
  ]
  ```

### 7. Global Search
**Status**: 🔄 Updated
- **Endpoints**:
  - `GET /api/blogs?search=query`
  - `GET /api/users?search=query`
  - `GET /api/menu?search=query`
- **Change**: Added `search` query parameter to filter results by name/title/content.

### 8. Blog Schema Compatibility
**Status**: 🔄 Updated
- **Endpoints**: `GET /api/blogs`, `POST /api/blogs`
- **Change**: Supports both single string (`menu`, `submenu`) and array (`menus`, `submenus`) formats.
- **Note**: Backend automatically handles conversion. Frontend can send/receive single strings.

### 9. Secure Admin Endpoints
**Status**: 🔒 Secured
- **Endpoints**:
  - `DELETE /api/users/:id`
  - `GET /api/dashboard-stats`
- **Change**: Now requires `Authorization: Bearer <token>` with an **Admin** role.

---

## 🌐 CORS Configuration
**Status**: ✅ Updated
- **Allowed Origins**:
  - `https://dasalon-blogs.vercel.app`
  - `https://dasalon.com`
  - `https://www.dasalon.com`
  - `http://localhost:3000`
