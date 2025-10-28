#!/usr/bin/env node

/**
 * Script to replace a file with another file
 * Usage: node scripts/replace-file.js <source> <target>
 * 
 * Arguments:
 * source - Path to the source file
 * target - Path to the target file to be replaced
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/replace-file.js <source> <target>');
  process.exit(1);
}

const sourcePath = args[0];
const targetPath = args[1];

try {
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  // Check if target file exists
  if (fs.existsSync(targetPath)) {
    // Delete target file
    fs.unlinkSync(targetPath);
  }

  // Copy source to target
  fs.copyFileSync(sourcePath, targetPath);

  // Delete source file
  fs.unlinkSync(sourcePath);

  console.log(`Successfully replaced ${targetPath} with ${sourcePath}`);
} catch (error) {
  console.error('Error replacing file:', error.message);
  process.exit(1);
}
