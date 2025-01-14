import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = sqlite3.verbose();
const dbFile = path.resolve(__dirname, 'tripPlanner.db');
const db = new sqlite.Database(dbFile, (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

export function initDatabase() {
  return new Promise((resolve, reject) => {
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
}

export function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(`Error closing database: ${err.message}`);
      else resolve();
    });
  });
}

export { db };
