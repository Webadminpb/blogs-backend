require('dotenv').config();
const axios = require('axios');
const { Blog, User } = require('./models');
const { endpoints, normalise, toSlug, getAssetUrl } = require('./strapi-helpers');

function extractImagesFromContent(content = '') {
  const images = [];
  const regex = /<img[^>]+src="([^">]+)"/gi;
  let match;
  while ((match = regex.exec(content))) {
    images.push(match[1]);
  }
  return images;
}

const unpackCollection = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.data)) return value.data;
  return [];
};

async function buildAuthorObjects(strapiAuthors = []) {
  const authors = [];
  for (const rawAuthor of unpackCollection(strapiAuthors)) {
    const strapiAuthor = normalise(rawAuthor);
    const user = await User.findOne({
      name: strapiAuthor.name,
      role: 'author',
    });
    if (user) {
      authors.push({
        _id: user._id,
        name: user.name,
        image: user.image,
        description: user.description,
      });
    }
  }
  return authors;
}

const mapRelationSlugs = (items = []) =>
  unpackCollection(items)
    .map((item) => normalise(item))
    .map((item) => item.slug || toSlug(item.name))
    .filter(Boolean);

async function migrateBlogs() {
  console.log('Fetching blogs from Strapi...');
  const response = await axios.get(endpoints.blogs);
  const strapiBlogs = response.data?.data || [];
  console.log(`Found ${strapiBlogs.length} blogs in Strapi`);

  for (const entry of strapiBlogs) {
    const strapiBlog = normalise(entry);
    const authors = await buildAuthorObjects(strapiBlog.authors);
    const menus = mapRelationSlugs(strapiBlog.menus);
    const submenus = mapRelationSlugs(strapiBlog.submenus);
    const tags = unpackCollection(strapiBlog.tags).map((tag) => {
      const mapped = normalise(tag);
      return mapped.name;
    });
    const images = extractImagesFromContent(strapiBlog.content || '');

    const blogData = {
      title: strapiBlog.title,
      slug: strapiBlog.slug || toSlug(strapiBlog.title),
      description: strapiBlog.description,
      content: strapiBlog.content,
      authors,
      menus,
      submenus,
      thumbnail: getAssetUrl(strapiBlog.thumbnail) || '',
      images,
      tags,
      status: strapiBlog.publishedAt ? 'published' : 'draft',
      featured: Boolean(strapiBlog.featured),
      shareUrl: strapiBlog.shareUrl || null,
      views: 0,
      index: strapiBlog.index || 0,
      createdAt: strapiBlog.createdAt
        ? new Date(strapiBlog.createdAt)
        : new Date(),
      updatedAt: strapiBlog.updatedAt
        ? new Date(strapiBlog.updatedAt)
        : new Date(),
    };

    const existingBlog = await Blog.findOne({ slug: blogData.slug });
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

