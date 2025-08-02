// test/setup.ts
import { execSync } from 'child_process';

export default async () => {
  console.log('\n🚀 Setting up the E2E test environment...');

  // Define the commands to be executed
  const buildCommand = 'pnpm build';
  const migrateCommand =
    'dotenv -e test.env -- pnpm prisma migrate reset --force';

  try {
    // 1. First, compile the project including the seed script
    console.log('Compiling project...');
    execSync(buildCommand, { stdio: 'inherit' });
    console.log('Compilation complete.');

    // 2. Then, reset the database. Prisma will now find and run the compiled seed.js
    console.log('Resetting test database...');
    execSync(migrateCommand, { stdio: 'inherit' });
    console.log('✅ Test database reset successfully.');
  } catch (error) {
    console.error('❌ Failed to set up the test database.');
    console.error(error);
    process.exit(1);
  }
};
