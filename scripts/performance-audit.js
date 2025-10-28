import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Starting performance audit...\n');

class PerformanceAuditor {
  constructor() {
    this.issues = [];
    this.recommendations = [];
    this.stats = {
      totalFiles: 0,
      totalSize: 0,
      largeFiles: [],
      duplicateImports: [],
      unusedDependencies: [],
    };
  }

  async runAudit() {
    try {
      await this.analyzeProjectStructure();
      await this.analyzeDependencies();
      await this.analyzeBundleSize();
      await this.analyzeImages();
      await this.analyzeCodeQuality();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeProjectStructure() {
    console.log('📁 Analyzing project structure...');
    
    const projectRoot = path.join(__dirname, '..');
    const directories = [
      'app/components',
      'app/pages',
      'app/assets',
      'public',
      'server/api',
    ];

    for (const dir of directories) {
      const dirPath = path.join(projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        const stats = this.getDirectoryStats(dirPath);
        this.stats.totalFiles += stats.fileCount;
        this.stats.totalSize += stats.totalSize;
        
        console.log(`   ${dir}: ${stats.fileCount} files, ${this.formatBytes(stats.totalSize)}`);
        
        // Check for large files
        if (stats.largeFiles.length > 0) {
          this.stats.largeFiles.push(...stats.largeFiles.map(f => ({ ...f, directory: dir })));
        }
      }
    }
  }

  async analyzeDependencies() {
    console.log('\n📦 Analyzing dependencies...');
    
    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const { dependencies, devDependencies } = packageJson;
      const allDeps = { ...dependencies, ...devDependencies };
      
      console.log(`   Total dependencies: ${Object.keys(allDeps).length}`);
      
      // Check for potentially heavy dependencies
      const heavyDeps = [
        'echarts', 'd3', 'vis-network', 'vis-data', 'vuetify',
        'nuxt-particles', 'tsparticles-engine', 'mjml'
      ];
      
      const foundHeavyDeps = heavyDeps.filter(dep => allDeps[dep]);
      if (foundHeavyDeps.length > 0) {
        this.recommendations.push({
          type: 'dependency',
          severity: 'medium',
          message: `Consider lazy loading heavy dependencies: ${foundHeavyDeps.join(', ')}`,
        });
      }
      
      // Check for duplicate functionality
      const duplicateChecks = [
        { group: 'Date libraries', deps: ['date-fns', 'dayjs'] },
        { group: 'Validation', deps: ['validator', 'zod'] },
        { group: 'Cryptography', deps: ['bcrypt', 'bcrypt-ts'] },
      ];
      
      for (const check of duplicateChecks) {
        const found = check.deps.filter(dep => allDeps[dep]);
        if (found.length > 1) {
          this.recommendations.push({
            type: 'dependency',
            severity: 'low',
            message: `Consider consolidating ${check.group}: ${found.join(', ')}`,
          });
        }
      }
      
    } catch (error) {
      console.error('   ❌ Failed to analyze dependencies:', error.message);
    }
  }

  async analyzeBundleSize() {
    console.log('\n📊 Analyzing bundle size...');
    
    try {
      // Check if .output directory exists (after build)
      const outputDir = path.join(__dirname, '..', '.output');
      if (fs.existsSync(outputDir)) {
        const bundleStats = this.getDirectoryStats(outputDir);
        console.log(`   Build size: ${this.formatBytes(bundleStats.totalSize)}`);
        
        // Analyze specific bundle files
        const clientDir = path.join(outputDir, 'public', '_nuxt');
        if (fs.existsSync(clientDir)) {
          const clientFiles = fs.readdirSync(clientDir);
          const jsFiles = clientFiles.filter(file => file.endsWith('.js'));
          
          for (const file of jsFiles) {
            const filePath = path.join(clientDir, file);
            const stats = fs.statSync(filePath);
            const sizeInMB = stats.size / (1024 * 1024);
            
            if (sizeInMB > 1) {
              this.recommendations.push({
                type: 'bundle',
                severity: 'high',
                message: `Large bundle file: ${file} (${this.formatBytes(stats.size)})`,
              });
            }
          }
        }
      } else {
        console.log('   ℹ️ No build output found. Run "npm run build" first.');
      }
    } catch (error) {
      console.error('   ❌ Failed to analyze bundle size:', error.message);
    }
  }

  async analyzeImages() {
    console.log('\n🖼️ Analyzing images...');
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const publicDir = path.join(__dirname, '..', 'public');
    
    if (fs.existsSync(publicDir)) {
      const imageFiles = this.findFilesByExtension(publicDir, imageExtensions);
      let totalImageSize = 0;
      const largeImages = [];
      
      for (const file of imageFiles) {
        const stats = fs.statSync(file);
        totalImageSize += stats.size;
        
        const sizeInMB = stats.size / (1024 * 1024);
        if (sizeInMB > 1) {
          largeImages.push({
            path: path.relative(publicDir, file),
            size: stats.size,
          });
        }
      }
      
      console.log(`   Total images: ${imageFiles.length}`);
      console.log(`   Total image size: ${this.formatBytes(totalImageSize)}`);
      
      if (largeImages.length > 0) {
        console.log('   Large images found:');
        largeImages.forEach(img => {
          console.log(`     - ${img.path}: ${this.formatBytes(img.size)}`);
        });
        
        this.recommendations.push({
          type: 'image',
          severity: 'medium',
          message: `Consider optimizing ${largeImages.length} large images`,
        });
      }
    }
  }

  async analyzeCodeQuality() {
    console.log('\n🔍 Analyzing code quality...');
    
    try {
      // Check for TypeScript errors
      console.log('   Running TypeScript check...');
      execSync('npm run type-check', { stdio: 'pipe' });
      console.log('   ✅ TypeScript check passed');
    } catch (error) {
      this.issues.push({
        type: 'typescript',
        severity: 'high',
        message: 'TypeScript errors found',
      });
    }
    
    try {
      // Check for linting issues
      console.log('   Running ESLint check...');
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('   ✅ ESLint check passed');
    } catch (error) {
      this.issues.push({
        type: 'linting',
        severity: 'medium',
        message: 'ESLint issues found',
      });
    }
  }

  async generateReport() {
    console.log('\n📋 Generating performance report...\n');
    
    const report = {
      summary: {
        totalFiles: this.stats.totalFiles,
        totalSize: this.formatBytes(this.stats.totalSize),
        issues: this.issues.length,
        recommendations: this.recommendations.length,
      },
      issues: this.issues,
      recommendations: this.recommendations,
      optimizationScore: this.calculateOptimizationScore(),
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'performance-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('🎯 Performance Audit Summary');
    console.log('============================');
    console.log(`📁 Total files: ${report.summary.totalFiles}`);
    console.log(`📦 Total size: ${report.summary.totalSize}`);
    console.log(`⚠️ Issues found: ${report.summary.issues}`);
    console.log(`💡 Recommendations: ${report.summary.recommendations}`);
    console.log(`⭐ Optimization score: ${report.optimizationScore}/100`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 Issues:');
      this.issues.forEach(issue => {
        console.log(`   [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.recommendations.forEach(rec => {
        console.log(`   [${rec.severity.toUpperCase()}] ${rec.message}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    // Performance tips
    console.log('\n🚀 Quick Performance Tips:');
    console.log('   1. Use lazy loading for heavy components');
    console.log('   2. Optimize images (WebP format, proper sizing)');
    console.log('   3. Enable gzip compression on your server');
    console.log('   4. Use a CDN for static assets');
    console.log('   5. Monitor Core Web Vitals in production');
    console.log('   6. Implement service worker for caching');
    console.log('   7. Use tree shaking to reduce bundle size');
    console.log('   8. Consider code splitting for large pages');
  }

  // Helper methods
  getDirectoryStats(dirPath) {
    const stats = {
      fileCount: 0,
      totalSize: 0,
      largeFiles: [],
    };
    
    const processDirectory = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const itemStats = fs.statSync(itemPath);
        
        if (itemStats.isDirectory()) {
          processDirectory(itemPath);
        } else {
          stats.fileCount++;
          stats.totalSize += itemStats.size;
          
          const sizeInMB = itemStats.size / (1024 * 1024);
          if (sizeInMB > 1) {
            stats.largeFiles.push({
              path: path.relative(dirPath, itemPath),
              size: itemStats.size,
            });
          }
        }
      }
    };
    
    processDirectory(dirPath);
    return stats;
  }

  findFilesByExtension(dirPath, extensions) {
    const files = [];
    
    const processDirectory = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const itemStats = fs.statSync(itemPath);
        
        if (itemStats.isDirectory()) {
          processDirectory(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(itemPath);
          }
        }
      }
    };
    
    processDirectory(dirPath);
    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  calculateOptimizationScore() {
    let score = 100;
    
    // Deduct points for issues
    score -= this.issues.length * 10;
    
    // Deduct points for recommendations
    score -= this.recommendations.length * 2;
    
    // Deduct points for large files
    score -= this.stats.largeFiles.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }
}

// Run the audit
const auditor = new PerformanceAuditor();
auditor.runAudit();
