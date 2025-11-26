require('dotenv').config();
const axios = require('axios');
const { User } = require('./models');
const { endpoints, normalise, getAssetUrl } = require('./strapi-helpers');

async function migrateAuthors() {
  console.log('Fetching authors from Strapi...');
  const response = await axios.get(endpoints.authors);
  const strapiAuthors = response.data?.data || [];
  console.log(`Found ${strapiAuthors.length} authors in Strapi`);

  for (const entry of strapiAuthors) {
    const strapiAuthor = normalise(entry);
    const authorData = {
      name: strapiAuthor.name,
      email: strapiAuthor.email || null,
      role: 'author',
      education: strapiAuthor.education || null,
      address: strapiAuthor.address || null,
      instagram: strapiAuthor.instagram || null,
      linkedin: strapiAuthor.linkedin || null,
      description: strapiAuthor.description || null,
      image: getAssetUrl(strapiAuthor.image),
      index: strapiAuthor.index || 0,
    };

    const existingAuthor = await User.findOne({
      name: strapiAuthor.name,
      role: 'author',
    });

    if (existingAuthor) {
      await User.updateOne({ _id: existingAuthor._id }, { $set: authorData });
      console.log(`✓ Updated author: ${strapiAuthor.name}`);
    } else {
      await User.create(authorData);
      console.log(`✓ Created author: ${strapiAuthor.name}`);
    }
  }

  console.log('Author migration completed!');
}

module.exports = migrateAuthors;

