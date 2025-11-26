require('dotenv').config();
const mongoose = require('mongoose');
const migrateAuthors = require('./migrate-authors');
const migrateMenus = require('./migrate-menus');
const migrateBlogs = require('./migrate-blogs');

async function runMigration() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI or MONGO_URI environment variable');
  }

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to database');

    console.log('\n=== Step 1: Migrating Authors ===');
    await migrateAuthors();

    console.log('\n=== Step 2: Migrating Menus & Submenus ===');
    await migrateMenus();

    console.log('\n=== Step 3: Migrating Blogs ===');
    await migrateBlogs();

    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from database');
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
