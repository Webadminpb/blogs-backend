require('dotenv').config();

async function rollback() {
  console.log('Rollback requires restoring your MongoDB backup manually.');
  console.log(
    'Example: mongorestore --uri="$MONGODB_URI" --archive=backup.archive',
  );
  console.log('Rollback completed');
}

if (require.main === module) {
  rollback();
}

module.exports = rollback;

