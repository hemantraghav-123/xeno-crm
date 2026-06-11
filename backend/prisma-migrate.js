const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'prisma', 'migrations');

let migrationsExist = false;
try {
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir);
    migrationsExist = files.some(file => {
      const fullPath = path.join(migrationsDir, file);
      return fs.statSync(fullPath).isDirectory();
    });
  }
} catch (err) {
  // Directory check failed, treat as migrations don't exist
  migrationsExist = false;
}

try {
  if (!migrationsExist) {
    console.log('No migrations found. Running prisma migrate dev...');
    // In non-interactive mode, dev requires a migration name.
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('-Migration applied');
  } else {
    console.log('Migrations found. Running prisma migrate deploy...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('-Migration applied');
    } catch (deployError) {
      console.log('prisma migrate deploy failed. Attempting prisma migrate dev...');
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      console.log('-Migration applied');
    }
  }
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
