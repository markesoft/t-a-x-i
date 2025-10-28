import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting optimized build process...");

try {
  // Step 1: Clean previous builds
  console.log("🧹 Cleaning previous builds...");
  const outputDir = path.join(__dirname, "..", ".output");
  const nuxtDir = path.join(__dirname, "..", ".nuxt");

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log("✅ Cleaned .output directory");
  }

  /*  if (fs.existsSync(nuxtDir)) {
    fs.rmSync(nuxtDir, { recursive: true, force: true });
    console.log('✅ Cleaned .nuxt directory');
  } */

  // Step 2: Generate Prisma client
  console.log("🗄️ Generating Prisma client...");
  //execSync('npx prisma generate', { stdio: 'inherit' });
  execSync("npm run prisma_generate_sql", { stdio: "inherit" });
  console.log("✅ Prisma client generated");

  // Step 3: Build the application
  console.log("🔨 Building application...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Application built successfully");

  // Step 4: Fix dirname issue
  console.log("🔧 Fixing dirname issue...");
  const nitroFilePath = path.join(
    __dirname,
    "..",
    ".output",
    "server",
    "chunks",
    "_",
    "nitro.mjs"
  );

  if (fs.existsSync(nitroFilePath)) {
    let content = fs.readFileSync(nitroFilePath, "utf8");

    if (!content.includes("/* add by baek */")) {
      const codeToInsert = `
/* add by baek */
import { dirname as drnm } from 'path';
//import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = drnm(__filename);
/* end my block */
`;

      const lines = content.split("\n");
      let insertLineIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("import ")) {
          insertLineIndex = i + 1;
        } else if (insertLineIndex > 0 && lines[i].trim() !== "") {
          break;
        }
      }

      lines.splice(insertLineIndex, 0, codeToInsert);
      const newContent = lines.join("\n");

      fs.writeFileSync(nitroFilePath, newContent, "utf8");
      console.log("✅ Successfully added __dirname definition to nitro.mjs");
    } else {
      console.log(
        "ℹ️ The __dirname definition is already present in nitro.mjs"
      );
    }
  } else {
    console.error(`❌ File not found: ${nitroFilePath}`);
  }

  // Step 5: Optimize static assets
  console.log("📦 Optimizing static assets...");
  const publicDir = path.join(__dirname, "..", "public");
  const uploadsDir = path.join(__dirname, "..", "public", "uploads");

  if (fs.existsSync(uploadsDir)) {
    console.log("ℹ️ Uploads directory found - consider optimizing images");
  }

  // Step 6: Generate build info
  const buildInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.0.1",
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  const buildInfoPath = path.join(
    __dirname,
    "..",
    ".output",
    "build-info.json"
  );
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log("✅ Build info generated");

  // Step 7: Performance analysis
  console.log("📊 Analyzing build performance...");
  const outputSize = getDirectorySize(outputDir);
  console.log(`📈 Build size: ${formatBytes(outputSize)}`);

  console.log("🎉 Optimized build completed successfully!");
  console.log("💡 Performance tips:");
  console.log("   - Enable gzip compression on your server");
  console.log("   - Use a CDN for static assets");
  console.log("   - Consider implementing image optimization");
  console.log("   - Monitor Core Web Vitals in production");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}

// Helper functions
function getDirectorySize(dirPath) {
  let totalSize = 0;

  if (fs.existsSync(dirPath)) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        totalSize += getDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  }

  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
