import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the nitro.mjs file
const nitroFilePath = path.join(__dirname,"..", '.output', 'server', 'chunks', '_', 'nitro.mjs');

// The code to insert
const codeToInsert = `
/* add by baek */
import { dirname as drnm } from 'path';
//import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = drnm(__filename);
/* end my block */
`;

try {
  // Check if the file exists
  if (fs.existsSync(nitroFilePath)) {
    // Read the file content
    let content = fs.readFileSync(nitroFilePath, 'utf8');
    
    // Check if the code is already inserted
    if (!content.includes('/* add by baek */')) {
      // Find the position after the imports section
      // Look for the first non-import statement after imports
      const lines = content.split('\n');
      let insertLineIndex = 0;
      
      // Find the last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertLineIndex = i + 1;
        } else if (insertLineIndex > 0 && lines[i].trim() !== '') {
          // We've found the first non-empty line after imports
          break;
        }
      }
      
      // Insert our code after the imports
      lines.splice(insertLineIndex, 0, codeToInsert);
      const newContent = lines.join('\n');
      
      // Write the modified content back to the file
      fs.writeFileSync(nitroFilePath, newContent, 'utf8');
      console.log('✅ Successfully added __dirname definition to nitro.mjs');
    } else {
      console.log('ℹ️ The __dirname definition is already present in nitro.mjs');
    }
  } else {
    console.error(`❌ File not found: ${nitroFilePath}`);
    console.log('Make sure you run this script after building your project');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}