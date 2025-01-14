import sqlite3 from 'sqlite3';

export async function setupTestDatabase() {
  const sqlite = sqlite3.verbose();
  const db = new sqlite.Database(':memory:');

  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          login TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
        )`,
        (err) => {
          if (err) reject(`Error creating users table: ${err.message}`);
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          country TEXT,
          last_open_time INTEGER,
          number_of_places INTEGER DEFAULT 0,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        (err) => {
          if (err) reject(`Error creating trips table: ${err.message}`);
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_name TEXT NOT NULL,
          description TEXT,
          visit_start INTEGER, 
          visit_end INTEGER,   
          priority INTEGER DEFAULT 0,
          trip_id INTEGER,
          FOREIGN KEY (trip_id) REFERENCES trips(id)
        )`,
        (err) => {
          if (err) reject(`Error creating locations table: ${err.message}`);
        }
      );

      resolve();
    });
  });

  describe('Database Tests', () => {
    it('Should pass a basic test', () => {
      expect(true).toBe(true);
    });
  });
  return db;
}
