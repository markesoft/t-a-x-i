#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const packageJson = require('../package.json');

// Get all JavaScript/TypeScript files in the project
function getAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, and other common directories
      if (['node_modules', '.git', '.nuxt', '.output', 'dist'].includes(file)) {
        return;
      }
      getAllSourceFiles(filePath, fileList);
    } else if (file.match(/\.(js|jsx|ts|tsx|vue)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all imports from files
function getUsedDependencies(files) {
  const usedDeps = new Set();
  const importRegex = /from\s+['"]([^'"@][^/\"']*)/g;
  const requireRegex = /require\(['"]([^'"@][^/\"']*)/g;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      
      // Check for ES6 imports
      while ((match = importRegex.exec(content)) !== null) {
        const dep = match[1].split('/')[0];
        usedDeps.add(dep);
      }
      
      // Check for CommonJS requires
      while ((match = requireRegex.exec(content)) !== null) {
        const dep = match[1].split('/')[0];
        usedDeps.add(dep);
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });
  
  return Array.from(usedDeps);
}

// Find unused dependencies
function findUnusedDependencies(usedDeps) {
  const allDeps = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ];
  
  return allDeps.filter(dep => !usedDeps.includes(dep));
}

// Find unused scripts
function findUnusedScripts() {
  const scriptFiles = getAllSourceFiles(path.join(__dirname, '..'));
  const scriptContent = scriptFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  const usedScripts = [];
  
  // Check which scripts are referenced in the codebase
  Object.keys(packageJson.scripts || {}).forEach(script => {
    if (script !== 'postinstall' && scriptContent.includes(`npm run ${script}`)) {
      usedScripts.push(script);
    }
  });
  
  return Object.keys(packageJson.scripts || {}).filter(
    script => !usedScripts.includes(script) && !['start', 'build', 'dev', 'test', 'lint'].includes(script)
  );
}

// Main function
function main() {
  console.log('🔍 Analyzing project dependencies...\n');
  
  // Get all source files
  const sourceFiles = getAllSourceFiles(path.join(__dirname, '..'));
  console.log(`📂 Found ${sourceFiles.length} source files`);
  
  // Get used dependencies
  const usedDeps = getUsedDependencies(sourceFiles);
  
  // Find unused dependencies
  const unusedDeps = findUnusedDependencies(usedDeps);
  
  // Find unused scripts
  const unusedScripts = findUnusedScripts();
  
  // Generate report
  console.log('\n📊 Optimization Report:');
  console.log('='.repeat(50));
  
  // Unused dependencies report
  console.log('\n🔍 Potentially Unused Dependencies:');
  console.log('-'.repeat(40));
  if (unusedDeps.length > 0) {
    unusedDeps.forEach(dep => {
      const isDevDep = packageJson.devDependencies && packageJson.devDependencies[dep];
      console.log(`- ${dep} (${isDevDep ? 'devDependency' : 'dependency'})`);
    });
    console.log('\n💡 Tip: You can remove these with:');
    const depsToRemove = unusedDeps.filter(dep => packageJson.dependencies?.[dep]);
    const devDepsToRemove = unusedDeps.filter(dep => packageJson.devDependencies?.[dep]);
    
    if (depsToRemove.length > 0) {
      console.log(`npm uninstall ${depsToRemove.join(' ')}`);
    }
    if (devDepsToRemove.length > 0) {
      console.log(`npm uninstall --save-dev ${devDepsToRemove.join(' ')}`);
    }
  } else {
    console.log('No unused dependencies found! 🎉');
  }
  
  // Unused scripts report
  console.log('\n📜 Potentially Unused Scripts:');
  console.log('-'.repeat(40));
  if (unusedScripts.length > 0) {
    unusedScripts.forEach(script => {
      console.log(`- ${script}: ${packageJson.scripts[script]}`);
    });
  } else {
    console.log('No unused scripts found! 🎉');
  }
  
  console.log('\n✅ Analysis complete!');
  console.log('='.repeat(50));
  console.log('\n💡 Note: Please review the suggestions carefully before removing anything.');
  console.log('Some dependencies might be used in ways not detected by static analysis.');
}

// Run the analysis
main();
