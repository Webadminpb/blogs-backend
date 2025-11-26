const STRAPI_BASE_URL =
  process.env.STRAPI_API_URL ||
  'https://dasalon-blog-73430e9b5067.herokuapp.com/api';

const endpoints = {
  authors: `${STRAPI_BASE_URL}/authors?populate=*`,
  blogs: `${STRAPI_BASE_URL}/blogs?populate=*`,
  menus: `${STRAPI_BASE_URL}/menus?populate=*`,
  submenus: `${STRAPI_BASE_URL}/submenus?populate=*`,
  tags: `${STRAPI_BASE_URL}/tags?populate=*`,
};

const normalise = (entry) => {
  if (!entry) return {};
  if (entry.attributes) {
    return { id: entry.id, ...entry.attributes };
  }
  return entry;
};

const getAssetUrl = (asset) => {
  if (!asset) return null;
  if (typeof asset === 'string') return asset;
  if (asset.url) return asset.url;
  if (asset.data?.attributes?.url) {
    return asset.data.attributes.url;
  }
  return null;
};

const toSlug = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

module.exports = {
  endpoints,
  normalise,
  getAssetUrl,
  toSlug,
};

