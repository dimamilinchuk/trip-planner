import { db } from './database.js';

export function getTripsByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM trips WHERE user_id = ?', [userId], (err, trips) => {
      if (err) {
        reject(`Error fetching trips: ${err.message}`);
      } else {
        resolve(trips);
      }
    });
  });
}

export function createTrip(userId, tripData) {
  const { name, description, country, lastOpenTime, numberOfPlaces } = tripData;
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO trips (name, description, country, last_open_time, number_of_places, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, country, lastOpenTime, numberOfPlaces, userId],
      function (err) {
        if (err) {
          reject(`Error creating trip: ${err.message}`);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}
