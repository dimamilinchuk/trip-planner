import { db } from './database.js';

export function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        reject(`Error fetching user: ${err.message}`);
      } else {
        resolve(user);
      }
    });
  });
}

export function createUser(login, email, password) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (login, email, password) VALUES (?, ?, ?)`,
      [login, email, password],
      function (err) {
        if (err) {
          reject(`Error creating user: ${err.message}`);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}
