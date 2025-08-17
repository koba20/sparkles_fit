import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://ogbinybtbasmkvagvgai.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYmlueWJ0YmFzbWt2YWd2Z2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODUyNTUsImV4cCI6MjA2OTA2MTI1NX0.QmOLiZTU0NqUNPdZZXWDFSjiO0qIcLLQZkeAXGWA_w8';

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'apply_orders_migration.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split the SQL content into individual statements
const sqlStatements = sqlContent
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0)
  .map(statement => statement + ';');

// Function to execute SQL via REST API
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    // Create a direct SQL query using the SQL API
    const options = {
      hostname: 'ogbinybtbasmkvagvgai.supabase.co',
      port: 443,
      path: '/rest/v1/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'params=single-object'
      }
    };

    const data = JSON.stringify({
      query: sql
    });

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Success');
          resolve(responseData);
        } else {
          console.log('❌ Error:', res.statusCode, responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Execute all statements
async function runMigration() {
  console.log('🚀 Starting orders table migration...');

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`\n📝 Executing statement ${i + 1}/${sqlStatements.length}:`);
    console.log(sql.substring(0, 100) + '...');

    try {
      await executeSQL(sql);
      // Add a small delay between statements
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`❌ Failed to execute statement ${i + 1}:`, error.message);
      // Continue with next statement
    }
  }

  console.log('\n✅ Orders table migration completed!');
}

runMigration().catch(console.error);