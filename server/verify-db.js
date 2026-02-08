import pool from './db/connection.js';

async function verifyDatabase() {
  try {
    console.log('\n=== DATABASE VERIFICATION ===\n');
    
    // Check users
    const [users] = await pool.query('SELECT id, username, created_at FROM users');
    console.log('Users in database:');
    console.table(users);
    
    // Check lists
    const [lists] = await pool.query('SELECT * FROM lists');
    console.log('\nLists in database:');
    console.table(lists);
    
    // Check tasks
    const [tasks] = await pool.query('SELECT * FROM tasks');
    console.log('\nTasks in database:');
    console.table(tasks);
    
    console.log('\n✓ Database verification complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('Error verifying database:', error);
    process.exit(1);
  }
}

verifyDatabase();
