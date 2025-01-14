import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

router.get('/:tripId', (req, res) => {
  const { tripId } = req.params;

  db.all(
    'SELECT * FROM locations WHERE trip_id = ?',
    [tripId],
    (err, locations) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch locations' });
      }
      res.status(200).json({ locations });
    }
  );
});

router.post('/', (req, res) => {
  const { locationName, description, visitTime, priority, tripId } = req.body;

  db.run(
    'INSERT INTO locations (location_name, description, visit_time, priority, trip_id) VALUES (?, ?, ?, ?, ?)',
    [locationName, description, visitTime, priority, tripId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create location' });
      }
      res.status(201).json({
        message: 'Location created successfully',
        locationId: this.lastID,
      });
    }
  );
});

export default router;
