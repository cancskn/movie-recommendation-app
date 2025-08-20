require('dotenv').config();
const { execSync } = require('child_process');

const startYear = parseInt(process.argv[2]) || 2015;
const endYear = parseInt(process.argv[3]) || 2020;
const pagesPerYear = 500; // Max allowed by TMDb per query

for (let year = startYear; year <= endYear; year++) {
  console.log(`\n🚀 Starting import for year ${year}...\n`);
  try {
    execSync(`node discover-movies.js ${year} ${pagesPerYear}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Failed to import for year ${year}:`, err.message);
  }
}
