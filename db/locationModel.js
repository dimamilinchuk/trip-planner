import { db } from './database.js';

export function getLocationsByTripId(tripId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM locations WHERE trip_id = ?',
      [tripId],
      (err, locations) => {
        if (err) {
          reject(`Error fetching locations: ${err.message}`);
        } else {
          resolve(locations);
        }
      }
    );
  });
}

export function createLocation(locationData) {
  const { locationName, description, visitStart, visitEnd, priority, tripId } =
    locationData;
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO locations (location_name, description, visit_start, visit_end, priority, trip_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [locationName, description, visitStart, visitEnd, priority, tripId],
      function (err) {
        if (err) {
          reject(`Error creating location: ${err.message}`);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}
