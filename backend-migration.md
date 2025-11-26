# Backend Migration Guide - Strapi Data Integration

> **Purpose**: This document provides complete instructions for the backend team to update schemas, create migration scripts, and integrate Strapi data into the DaSalon backend.

---

## Executive Summary

**Objective**: Fetch all data from Strapi CMS and populate the DaSalon backend database with authors, blogs, menus, and tags.

**Key Points**:
- ✓ Same S3 bucket used (no image migration needed, just update paths)
- ✓ No `strapiId` fields (simplified schema)
- ✓ Add `index` field to Authors, Blogs, and Menus for ordering
- ✓ Authors stored as object array with full details
- ✓ Support multiple menus per blog
- ✓ Merge duplicate authors by name
- ✓ Initialize views counter to 0

---

## Schema Updates Required

### 1. User Model (Authors)

**Add these 7 new fields:**

```typescript
// File: models/User.ts or schemas/userSchema.js

interface User {
  _id: ObjectId;
  name: string;
  email?: string;  // UPDATED: Make optional, leave empty if not available
  password?: string;  // Optional for authors
  role: 'user' | 'author' | 'admin';
  
  // NEW FIELDS (7 total)
  education?: string;
  address?: string;
  instagram?: string;
  linkedin?: string;
  description?: string;
  image?: string;  // S3 URL
  index?: number;  // NEW: Display order
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Migration Script for Existing Users:**
```javascript
// Add new fields with default values
db.users.updateMany(
  {},
  {
    $set: {
      education: null,
      address: null,
      instagram: null,
      linkedin: null,
      description: null,
      image: null,
      index: 0
    }
  }
);
```

---

### 2. Blog/Post Model

**Update authors field and add index:**

```typescript
// File: models/Blog.ts or schemas/blogSchema.js

interface Blog {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  content: string;
  
  // UPDATED: Change from string[] to Author object array
  authors: {
    _id: ObjectId;  // Reference to User._id
    name: string;
    image?: string;
    description?: string;
  }[];
  
  // UPDATED: Support multiple menus
  menus: string[];  // Array of menu slugs
  submenus: string[];  // Array of submenu slugs
  
  thumbnail: string;  // S3 URL
  images: string[];  // Additional image URLs from content
  
  tags: string[];
  
  status: 'draft' | 'published';
  featured: boolean;
  shareUrl?: string;
  views: number;
  
  index?: number;  // NEW: Display order
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Migration Script for Existing Blogs:**
```javascript
// Update authors from string[] to object[]
const blogs = await db.blogs.find({ authors: { $type: 'array' } });

for (const blog of blogs) {
  const authorObjects = [];
  
  for (const authorName of blog.authors) {
    const user = await db.users.findOne({ name: authorName, role: 'author' });
    if (user) {
      authorObjects.push({
        _id: user._id,
        name: user.name,
        image: user.image,
        description: user.description
      });
    }
  }
  
  await db.blogs.updateOne(
    { _id: blog._id },
    {
      $set: {
        authors: authorObjects,
        menus: [blog.menu],  // Convert single to array
        submenus: [blog.submenu],  // Convert single to array
        index: 0
      }
    }
  );
}
```

---

### 3. Menu Model

**Add new fields:**

```typescript
// File: models/Menu.ts or schemas/menuSchema.js

interface Menu {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;  // NEW
  index: number;  // NEW: Display order (required)
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Migration Script:**
```javascript
db.menus.updateMany(
  {},
  {
    $set: {
      description: null,
      index: 0
    }
  }
);
```

---

### 4. Submenu Model

**Add showOnHomePage field:**

```typescript
// File: models/Submenu.ts or schemas/submenuSchema.js

interface Submenu {
  _id: ObjectId;
  name: string;
  slug: string;
  parent_id: ObjectId;  // Reference to Menu._id
  showOnHomePage?: boolean;  // NEW
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Migration Script:**
```javascript
db.submenus.updateMany(
  {},
  {
    $set: {
      showOnHomePage: false
    }
  }
);
```

---

## Strapi API Endpoints

```javascript
const STRAPI_BASE_URL = 'https://dasalon-blog-73430e9b5067.herokuapp.com/api';

const endpoints = {
  authors: `${STRAPI_BASE_URL}/authors?populate=*`,
  blogs: `${STRAPI_BASE_URL}/blogs?populate=*`,
  categories: `${STRAPI_BASE_URL}/categories?populate=*`,
  menus: `${STRAPI_BASE_URL}/menus?populate=*`,
  submenus: `${STRAPI_BASE_URL}/submenus?populate=*`,
  tags: `${STRAPI_BASE_URL}/tags?populate=*`
};
```

---

## Migration Scripts

### Script 1: Migrate Authors

```javascript
// scripts/migrate-authors.js

const axios = require('axios');
const User = require('../models/User');

async function migrateAuthors() {
  console.log('Fetching authors from Strapi...');
  
  const response = await axios.get(
    'https://dasalon-blog-73430e9b5067.herokuapp.com/api/authors?populate=*'
  );
  
  const strapiAuthors = response.data.data;
  console.log(`Found ${strapiAuthors.length} authors in Strapi`);
  
  for (const strapiAuthor of strapiAuthors) {
    const authorData = {
      name: strapiAuthor.name,
      email: strapiAuthor.email || null,  // Leave empty if not available
      role: 'author',
      education: strapiAuthor.education,
      address: strapiAuthor.address,
      instagram: strapiAuthor.instagram,
      linkedin: strapiAuthor.linkedin,
      description: strapiAuthor.description,
      image: strapiAuthor.image?.url || null,  // Use existing S3 URL
      index: strapiAuthor.index || 0
    };
    
    // Check if author exists by name (merge duplicates)
    const existingAuthor = await User.findOne({ 
      name: strapiAuthor.name,
      role: 'author'
    });
    
    if (existingAuthor) {
      // Update existing author
      await User.updateOne(
        { _id: existingAuthor._id },
        { $set: authorData }
      );
      console.log(`✓ Updated author: ${strapiAuthor.name}`);
    } else {
      // Create new author
      await User.create(authorData);
      console.log(`✓ Created author: ${strapiAuthor.name}`);
    }
  }
  
  console.log('Author migration completed!');
}

module.exports = migrateAuthors;
```

---

### Script 2: Migrate Menus & Submenus

```javascript
// scripts/migrate-menus.js

const axios = require('axios');
const Menu = require('../models/Menu');
const Submenu = require('../models/Submenu');

async function migrateMenus() {
  console.log('Fetching menus from Strapi...');
  
  // Fetch Strapi menus
  const menusResponse = await axios.get(
    'https://dasalon-blog-73430e9b5067.herokuapp.com/api/menus?populate=*'
  );
  
  const strapiMenus = menusResponse.data.data;
  
  for (const strapiMenu of strapiMenus) {
    const menuData = {
      name: strapiMenu.name,
      slug: strapiMenu.slug || strapiMenu.name.toLowerCase().replace(/\s+/g, '-'),
      description: strapiMenu.description,
      index: strapiMenu.index || 0,
      status: true
    };
    
    // Check if menu exists
    let menu = await Menu.findOne({ slug: menuData.slug });
    
    if (menu) {
      await Menu.updateOne({ _id: menu._id }, { $set: menuData });
      console.log(`✓ Updated menu: ${strapiMenu.name}`);
    } else {
      menu = await Menu.create(menuData);
      console.log(`✓ Created menu: ${strapiMenu.name}`);
    }
  }
  
  // Fetch Strapi submenus
  const submenusResponse = await axios.get(
    'https://dasalon-blog-73430e9b5067.herokuapp.com/api/submenus?populate=*'
  );
  
  const strapiSubmenus = submenusResponse.data.data;
  
  for (const strapiSubmenu of strapiSubmenus) {
    // Find parent menu
    const parentMenu = await Menu.findOne({ 
      name: strapiSubmenu.menu?.name 
    });
    
    if (!parentMenu) {
      console.warn(`⚠ Parent menu not found for submenu: ${strapiSubmenu.name}`);
      continue;
    }
    
    const submenuData = {
      name: strapiSubmenu.name,
      slug: strapiSubmenu.slug || strapiSubmenu.name.toLowerCase().replace(/\s+/g, '-'),
      parent_id: parentMenu._id,
      showOnHomePage: strapiSubmenu.showOnHomePage || false,
      status: true
    };
    
    // Check if submenu exists
    const existingSubmenu = await Submenu.findOne({ 
      slug: submenuData.slug,
      parent_id: parentMenu._id
    });
    
    if (existingSubmenu) {
      await Submenu.updateOne({ _id: existingSubmenu._id }, { $set: submenuData });
      console.log(`✓ Updated submenu: ${strapiSubmenu.name}`);
    } else {
      await Submenu.create(submenuData);
      console.log(`✓ Created submenu: ${strapiSubmenu.name}`);
    }
  }
  
  console.log('Menu migration completed!');
}

module.exports = migrateMenus;
```

---

### Script 3: Migrate Blogs

```javascript
// scripts/migrate-blogs.js

const axios = require('axios');
const Blog = require('../models/Blog');
const User = require('../models/User');

async function migrateBlogs() {
  console.log('Fetching blogs from Strapi...');
  
  const response = await axios.get(
    'https://dasalon-blog-73430e9b5067.herokuapp.com/api/blogs?populate=*'
  );
  
  const strapiBlogs = response.data.data;
  console.log(`Found ${strapiBlogs.length} blogs in Strapi`);
  
  for (const strapiBlog of strapiBlogs) {
    // Map authors to object array
    const authors = [];
    for (const strapiAuthor of strapiBlog.authors || []) {
      const user = await User.findOne({ 
        name: strapiAuthor.name,
        role: 'author'
      });
      
      if (user) {
        authors.push({
          _id: user._id,
          name: user.name,
          image: user.image,
          description: user.description
        });
      }
    }
    
    // Extract menu slugs
    const menus = (strapiBlog.menus || []).map(m => 
      m.slug || m.name.toLowerCase().replace(/\s+/g, '-')
    );
    
    // Extract submenu slugs
    const submenus = (strapiBlog.submenus || []).map(sm => 
      sm.slug || sm.name.toLowerCase().replace(/\s+/g, '-')
    );
    
    // Extract tags
    const tags = (strapiBlog.tags || []).map(t => t.name);
    
    // Extract images from content (simple regex)
    const images = [];
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(strapiBlog.content || '')) !== null) {
      images.push(match[1]);
    }
    
    const blogData = {
      title: strapiBlog.title,
      slug: strapiBlog.slug,
      description: strapiBlog.description,
      content: strapiBlog.content,
      authors: authors,
      menus: menus,
      submenus: submenus,
      thumbnail: strapiBlog.thumbnail?.url || '',
      images: images,
      tags: tags,
      status: strapiBlog.publishedAt ? 'published' : 'draft',
      featured: strapiBlog.featured || false,
      shareUrl: strapiBlog.shareUrl,
      views: 0,  // Initialize to 0
      index: strapiBlog.index || 0,
      createdAt: new Date(strapiBlog.createdAt),
      updatedAt: new Date(strapiBlog.updatedAt)
    };
    
    // Check if blog exists by slug
    const existingBlog = await Blog.findOne({ slug: strapiBlog.slug });
    
    if (existingBlog) {
      await Blog.updateOne({ _id: existingBlog._id }, { $set: blogData });
      console.log(`✓ Updated blog: ${strapiBlog.title}`);
    } else {
      await Blog.create(blogData);
      console.log(`✓ Created blog: ${strapiBlog.title}`);
    }
  }
  
  console.log('Blog migration completed!');
}

module.exports = migrateBlogs;
```

---

### Master Migration Script

```javascript
// scripts/run-migration.js

const mongoose = require('mongoose');
const migrateAuthors = require('./migrate-authors');
const migrateMenus = require('./migrate-menus');
const migrateBlogs = require('./migrate-blogs');

async function runMigration() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to database');
    
    // Run migrations in order
    console.log('\n=== Step 1: Migrating Authors ===');
    await migrateAuthors();
    
    console.log('\n=== Step 2: Migrating Menus & Submenus ===');
    await migrateMenus();
    
    console.log('\n=== Step 3: Migrating Blogs ===');
    await migrateBlogs();
    
    console.log('\n✓ All migrations completed successfully!');
    
  } catch (error) {
    console.error('✗ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from database');
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
```

---

## API Endpoint Updates

### 1. Update Blog Endpoints to Populate Authors

```javascript
// routes/blogs.js

// GET /api/blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find()
    .populate('authors._id', 'name email image description education address instagram linkedin')
    .sort({ index: 1, createdAt: -1 });
  
  res.json(blogs);
});

// GET /api/blogs/:id
router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('authors._id', 'name email image description education address instagram linkedin');
  
  res.json(blog);
});
```

### 2. Create Author Profile Endpoints

```javascript
// routes/authors.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');

// GET /api/authors - Get all authors
router.get('/', async (req, res) => {
  const authors = await User.find({ role: 'author' })
    .select('-password')
    .sort({ index: 1, name: 1 });
  
  res.json(authors);
});

// GET /api/authors/:id - Get author by ID
router.get('/:id', async (req, res) => {
  const author = await User.findById(req.params.id)
    .select('-password');
  
  if (!author || author.role !== 'author') {
    return res.status(404).json({ message: 'Author not found' });
  }
  
  res.json(author);
});

// GET /api/authors/:id/blogs - Get blogs by author
router.get('/:id/blogs', async (req, res) => {
  const blogs = await Blog.find({
    'authors._id': req.params.id
  }).sort({ createdAt: -1 });
  
  res.json(blogs);
});

module.exports = router;
```

### 3. Update Menu Endpoints

```javascript
// routes/menu.js

// GET /api/menu - Get all menus with submenus
router.get('/', async (req, res) => {
  const menus = await Menu.find({ status: true })
    .sort({ index: 1, name: 1 });
  
  const result = [];
  
  for (const menu of menus) {
    const submenus = await Submenu.find({ 
      parent_id: menu._id,
      status: true
    }).sort({ name: 1 });
    
    result.push({
      menu: menu,
      submenus: submenus
    });
  }
  
  res.json(result);
});
```

---

## Testing Checklist

- [ ] Run schema migrations on development database
- [ ] Test author migration script
- [ ] Verify duplicate authors are merged
- [ ] Test menu/submenu migration
- [ ] Test blog migration
- [ ] Verify author references in blogs are correct
- [ ] Test blog API with populated authors
- [ ] Test author profile endpoints
- [ ] Verify images paths are correct
- [ ] Check multiple menus per blog work correctly
- [ ] Verify index fields for ordering
- [ ] Run on staging environment
- [ ] Backup production database
- [ ] Run on production

---

## Rollback Plan

```javascript
// scripts/rollback.js

async function rollback() {
  // Restore from backup
  // mongorestore --uri="mongodb://..." --archive=backup.archive
  
  console.log('Rollback completed');
}
```

---

## Environment Variables

```env
# .env
MONGODB_URI=mongodb://localhost:27017/dasalon-blog
STRAPI_API_URL=https://dasalon-blog-73430e9b5067.herokuapp.com/api
```

---

## Execution Steps

1. **Backup Database**
   ```bash
   mongodump --uri="mongodb://..." --archive=backup-$(date +%Y%m%d).archive
   ```

2. **Update Schemas**
   - Update User, Blog, Menu, Submenu models
   - Run schema migration scripts

3. **Run Migration**
   ```bash
   node scripts/run-migration.js
   ```

4. **Verify Data**
   - Check author count
   - Verify blog author references
   - Test API endpoints

5. **Deploy Backend**
   - Update API routes
   - Deploy to staging
   - Test thoroughly
   - Deploy to production
