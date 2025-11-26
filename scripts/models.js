const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['user', 'author', 'admin'],
      default: 'user',
    },
    education: String,
    address: String,
    instagram: String,
    linkedin: String,
    description: String,
    image: String,
    index: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const blogAuthorSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    image: String,
    description: String,
  },
  { _id: false },
);

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    content: String,
    authors: { type: [blogAuthorSchema], default: [] },
    menus: { type: [String], default: [] },
    submenus: { type: [String], default: [] },
    thumbnail: String,
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },
    shareUrl: String,
    views: { type: Number, default: 0 },
    index: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'posts' },
);

const menuSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, unique: true },
    description: String,
    index: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const submenuSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: String,
    parent_id: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    showOnHomePage: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const getModel = (name, schema, collection) => {
  if (mongoose.models[name]) {
    return mongoose.models[name];
  }
  return mongoose.model(name, schema, collection);
};

module.exports = {
  User: getModel('User', userSchema),
  Blog: getModel('Blog', blogSchema, 'posts'),
  Menu: getModel('Menu', menuSchema),
  Submenu: getModel('Submenu', submenuSchema),
};

