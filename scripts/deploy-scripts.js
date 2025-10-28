#!/usr/bin/env node

/**
 * Script to optimize package.json scripts for web deployment
 * Usage: node scripts/deploy-scripts.js [options]
 * 
 * Options:
 * --create            Create optimized scripts for deployment
 * --list              List current deployment-related scripts
 * --clean             Remove non-deployment scripts
 * --file [path]       Specify custom package.json path (default: ./package.json)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default path to package.json
let packageJsonPath = path.join(__dirname, '..', 'package.json');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  create: false,
  list: false,
  clean: false,
  file: null
};

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--create') options.create = true;
  else if (arg === '--list') options.list = true;
  else if (arg === '--clean') options.clean = true;
  else if (arg === '--file' && i + 1 < args.length) {
    options.file = args[++i];
    packageJsonPath = options.file;
  }
}

// Read package.json
let packageJson;
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

// Check if scripts section exists
if (!packageJson.scripts) {
  console.log('No scripts section found in package.json');
  process.exit(0);
}

const originalScripts = { ...packageJson.scripts };

// Define deployment-related scripts
const deploymentScripts = {
  // Core build scripts
  'build': 'nuxt build',
  'build:optimized': 'node ./scripts/optimized-build.js',
  'generate': 'nuxt generate',

  // Preview and serve
  'preview': 'nuxt preview',
  'serve': 'nuxt preview',

  // Prisma database
  'prisma:generate': 'npx prisma generate',
  'prisma:generate:sql': 'npx prisma generate --sql',

  // Dependencies
  'postinstall': 'nuxt prepare',
  'install:prod': 'npm install --production',

  // Cleanup
  'clean': 'rm -rf .output .nuxt dist node_modules/.cache',
  'clean:full': 'rm -rf .output .nuxt dist node_modules package-lock.json yarn.lock && npm install',

  // Deployment pipeline
  'deploy:prepare': 'npm run clean && npm run prisma:generate',
  'deploy:build': 'npm run build:optimized',
  'deploy:generate': 'npm run generate',

  // Quality checks
  'lint': 'eslint .',
  'lint:fix': 'eslint . --fix',
  'type-check': 'vue-tsc --noEmit'
};

// Function to find deployment-related scripts
function findDeploymentScripts(scripts) {
  const found = {};

  for (const [name, command] of Object.entries(scripts)) {
    // Check if it's a core deployment script
    if (deploymentScripts[name]) {
      found[name] = command;
      continue;
    }

    // Check if it contains deployment keywords
    const keywords = ['build', 'generate', 'deploy', 'preview', 'serve', 'prisma'];
    const hasKeyword = keywords.some(keyword => name.includes(keyword) || command.includes(keyword));

    if (hasKeyword) {
      found[name] = command;
    }
  }

  return found;
}

// Apply filters based on options
let scripts = { ...packageJson.scripts };

if (options.list) {
  // List deployment-related scripts
  const deploymentScripts = findDeploymentScripts(scripts);
  console.log('\n=== Deployment-related Scripts ===');
  console.log(`Found ${Object.keys(deploymentScripts).length} deployment scripts:\n`);

  Object.keys(deploymentScripts).forEach(name => {
    console.log(`  ${name}: ${deploymentScripts[name]}`);
  });

  process.exit(0);
}

if (options.clean) {
  // Keep only deployment-related scripts
  scripts = findDeploymentScripts(scripts);

  console.log('\n=== Cleaning for Deployment ===');
  console.log(`Kept ${Object.keys(scripts).length} deployment scripts out of ${Object.keys(originalScripts).length}\n`);

  Object.keys(scripts).forEach(name => {
    console.log(`  ${name}: ${scripts[name]}`);
  });
}

if (options.create) {
  // Add optimized deployment scripts if they don't exist
  console.log('\n=== Creating Deployment Scripts ===');

  let addedCount = 0;
  for (const [name, command] of Object.entries(deploymentScripts)) {
    if (!scripts[name]) {
      scripts[name] = command;
      console.log(`  Added: ${name} - ${command}`);
      addedCount++;
    }
  }

  if (addedCount === 0) {
    console.log('  All deployment scripts already exist.');
  }
}

// Write back to package.json if changes were made
if (options.clean || options.create) {
  packageJson.scripts = scripts;

  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`\nSuccessfully updated ${packageJsonPath}`);
  } catch (error) {
    console.error('Error writing package.json:', error.message);
  }
}
