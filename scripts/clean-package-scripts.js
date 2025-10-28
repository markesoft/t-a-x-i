#!/usr/bin/env node

/**
 * Script to clean up unnecessary commands from package.json scripts section
 * Usage: node scripts/clean-package-scripts.js [options]
 * 
 * Options:
 * --unused            Remove scripts that are not referenced in other scripts
 * --duplicate        Remove duplicate scripts
 * --custom           Remove custom scripts (not standard npm scripts)
 * --test             Only keep test-related scripts
 * --build            Only keep build-related scripts
 * --dev              Only keep development scripts
 * --list             Just list scripts without modifying
 * --file [path]      Specify custom package.json path (default: ./package.json)
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
  unused: false,
  duplicate: false,
  custom: false,
  test: false,
  build: false,
  dev: false,
  list: false,
  file: null
};

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--unused') options.unused = true;
  else if (arg === '--duplicate') options.duplicate = true;
  else if (arg === '--custom') options.custom = true;
  else if (arg === '--test') options.test = true;
  else if (arg === '--build') options.build = true;
  else if (arg === '--dev') options.dev = true;
  else if (arg === '--list') options.list = true;
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
const scripts = { ...packageJson.scripts };

// Function to check if a script is standard
function isStandardScript(scriptName) {
  const standardScripts = [
    'start', 'stop', 'restart', 'test', 'postinstall', 'preinstall',
    'build', 'dev', 'serve', 'lint', 'format', 'check'
  ];
  return standardScripts.includes(scriptName);
}

// Function to check if a script is development-related
function isDevScript(scriptName) {
  return ['dev', 'dev-host', 'lint', 'lint:fix', 'type-check'].includes(scriptName);
}

// Function to check if a script is build-related
function isBuildScript(scriptName) {
  return ['build', 'build:optimized', 'generate', 'preview'].includes(scriptName);
}

// Function to check if a script is test-related
function isTestScript(scriptName) {
  return scriptName.includes('test');
}

// Function to find all script references
function findScriptReferences(scripts, targetScript) {
  const references = [];

  for (const [name, command] of Object.entries(scripts)) {
    if (name === targetScript) continue;

    // Check if the command references the target script
    if (command.includes(`npm run ${targetScript}`) || 
        command.includes(`yarn ${targetScript}`) ||
        command.includes(`pnpm ${targetScript}`)) {
      references.push(name);
    }
  }

  return references;
}

// Apply filters based on options
if (options.test) {
  const testScripts = {};
  for (const [name, command] of Object.entries(scripts)) {
    if (isTestScript(name)) {
      testScripts[name] = command;
    }
  }
  Object.assign(scripts, testScripts);
} else if (options.build) {
  const buildScripts = {};
  for (const [name, command] of Object.entries(scripts)) {
    if (isBuildScript(name)) {
      buildScripts[name] = command;
    }
  }
  Object.assign(scripts, buildScripts);
} else if (options.dev) {
  const devScripts = {};
  for (const [name, command] of Object.entries(scripts)) {
    if (isDevScript(name)) {
      devScripts[name] = command;
    }
  }
  Object.assign(scripts, devScripts);
}

// Remove unused scripts
if (options.unused) {
  const usedScripts = new Set();

  // Find all scripts that are referenced by other scripts
  for (const [name, command] of Object.entries(scripts)) {
    for (const [refName, refCommand] of Object.entries(scripts)) {
      if (name === refName) continue;

      if (refCommand.includes(`npm run ${name}`) || 
          refCommand.includes(`yarn ${name}`) ||
          refCommand.includes(`pnpm ${name}`)) {
        usedScripts.add(name);
      }
    }
  }

  // Add scripts that are explicitly called
  for (const name of Object.keys(scripts)) {
    if (usedScripts.has(name) || isStandardScript(name)) {
      continue;
    }

    // Check if this script is referenced anywhere
    const references = findScriptReferences(scripts, name);
    if (references.length === 0) {
      delete scripts[name];
    }
  }
}

// Remove custom scripts (not standard)
if (options.custom) {
  for (const name of Object.keys(scripts)) {
    if (!isStandardScript(name)) {
      delete scripts[name];
    }
  }
}

// Remove duplicate scripts
if (options.duplicate) {
  const seenCommands = new Set();
  const duplicates = [];

  for (const [name, command] of Object.entries(scripts)) {
    if (seenCommands.has(command)) {
      duplicates.push(name);
    } else {
      seenCommands.add(command);
    }
  }

  for (const name of duplicates) {
    delete scripts[name];
  }
}

// Display results
console.log('\n=== Package.json Scripts Cleaner ===');
console.log(`\nOriginal scripts (${Object.keys(originalScripts).length}):`);
Object.keys(originalScripts).forEach(name => {
  console.log(`  ${name}: ${originalScripts[name]}`);
});

if (!options.list) {
  console.log(`\nFiltered scripts (${Object.keys(scripts).length}):`);
  Object.keys(scripts).forEach(name => {
    console.log(`  ${name}: ${scripts[name]}`);
  });

  // Write back to package.json if not in list mode
  if (Object.keys(scripts).length !== Object.keys(originalScripts).length) {
    packageJson.scripts = scripts;

    try {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`\nSuccessfully updated ${packageJsonPath}`);
    } catch (error) {
      console.error('Error writing package.json:', error.message);
    }
  } else {
    console.log('\nNo changes were made.');
  }
} else {
  console.log('\nListing mode - no changes made.');
}
