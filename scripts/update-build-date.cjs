const fs = require('fs');
const path = require('path');

const buildInfoPath = path.join(__dirname, '..', 'app', 'plugins', 'buildInfo.ts');
const buildDate = new Date().toISOString();
var cy = new Date();
var y = cy.getFullYear() - 2023;  // ex: 2018 - 2015 = 3  third year of program
var mo = cy.getMonth() + 1;        // ex: 2 = Feb
var dy = cy.getDate();           // ex: 12 = Date of month
var v = 'v' + y + '.' + mo + '.' + dy;    // ex: v3 = third year of program


const content = `export default defineNuxtPlugin(() => {
  const buildDate = "${buildDate}";
  
  return {
    provide: {
      buildInfo: {
        date: buildDate,
        version: "${v}"
      }
    }
  }
})`;

fs.writeFileSync(buildInfoPath, content, 'utf8');
console.log('Build date updated to:', buildDate, " Version:", v);
