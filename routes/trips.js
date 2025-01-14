import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const user = req.user;

  if (!user) {
    return res.redirect('/login');
  }

  db.all('SELECT * FROM trips WHERE user_id = ?', [user.id], (err, trips) => {
    if (err) {
      console.error('Database error:', err);
      return res
        .status(500)
        .render('index', { title: 'Trip Planner', user, trips: [] });
    }

    res.render('index', { title: 'Trip Planner', user, trips });
  });
});

router.post('/add', async (req, res) => {
  const { name, description, country, locations } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).redirect('/users/login');
  }

  let number_of_places = Array.isArray(locations) ? locations.length : 0;

  let tripId;
  try {
    tripId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO trips (name, description, country, last_open_time, number_of_places, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, country, Date.now(), number_of_places - 1, user.id],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve(this.lastID);
        }
      );
    });

    console.log('Created trip with ID:', tripId);

    if (locations && Array.isArray(locations)) {
      const locationStmt = db.prepare(
        'INSERT INTO locations (location_name, description, visit_start, visit_end, priority, trip_id) VALUES (?, ?, ?, ?, ?, ?)'
      );

      for (const location of locations) {
        const {
          name: locationName,
          description: locationDescription,
          visitStart,
          visitEnd,
          priority,
        } = location || {};

        await new Promise((resolve, reject) => {
          locationStmt.run(
            locationName,
            locationDescription || null,
            visitStart || null,
            visitEnd || null,
            priority || 0,
            tripId,
            (err) => (err ? reject(err) : resolve())
          );
        });
      }

      locationStmt.finalize();
    }

    res.redirect('/');
  } catch (err) {
    console.error('Failed to create trip or locations:', err);

    if (tripId) {
      db.run('DELETE FROM trips WHERE id = ?', [tripId], (deleteErr) => {
        if (deleteErr) {
          console.error('Failed to clean up trip after error:', deleteErr);
        }
      });
    }

    res.status(500).json({ error: 'Failed to create trip or locations' });
  }
});

router.get('/trip/:id', (req, res) => {
  const user = req.user;
  const tripId = req.params.id;

  if (!user) {
    return res.redirect('/login');
  }

  db.get(
    'SELECT * FROM trips WHERE id = ? AND user_id = ?',
    [tripId, user.id],
    (err, trip) => {
      if (err) {
        console.error('Database error:', err);
        return res
          .status(500)
          .render('trip', { title: 'Trip Details', user, trip: null });
      }

      if (!trip) {
        return res.status(404).render('404', { title: 'Not Found', user });
      }

      db.all(
        'SELECT * FROM locations WHERE trip_id = ?',
        [tripId],
        (err, locations) => {
          if (err) {
            console.error('Failed to fetch locations:', err);
            return res.status(500).render('trip', {
              title: 'Trip Details',
              user,
              trip,
              locations: [],
            });
          }

          res.render('trips', { title: trip.name, user, trip, locations });
        }
      );
    }
  );
});

router.post('/trip/:id/delete', (req, res) => {
  const user = req.user;
  const tripId = req.params.id;

  if (!user) {
    return res.status(401).redirect('/login');
  }

  db.run(
    'DELETE FROM trips WHERE id = ? AND user_id = ?',
    [tripId, user.id],
    (err) => {
      if (err) {
        console.error('Failed to delete trip:', err);
        return res.status(500).json({ error: 'Failed to delete trip' });
      }

      db.run('DELETE FROM locations WHERE trip_id = ?', [tripId], (err) => {
        if (err) {
          console.error('Failed to delete locations:', err);
        }
      });

      res.redirect('/');
    }
  );
});

router.post('/trip/:id/edit', async (req, res) => {
  const user = req.user;
  const tripId = req.params.id;
  const { name, description, country, locations } = req.body;

  if (!user) {
    return res.status(401).redirect('/login');
  }

  try {
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE trips SET name = ?, description = ?, country = ?, last_open_time = ? WHERE id = ? AND user_id = ?',
        [name, description, country, Date.now(), tripId, user.id],
        (err) => (err ? reject(err) : resolve())
      );
    });

    if (locations && Array.isArray(locations)) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM locations WHERE trip_id = ?', [tripId], (err) =>
          err ? reject(err) : resolve()
        );
      });

      const locationStmt = db.prepare(
        'INSERT INTO locations (location_name, description, visit_start, visit_end, priority, trip_id) VALUES (?, ?, ?, ?, ?, ?)'
      );

      for (const location of locations) {
        const {
          name: locationName,
          description: locationDescription,
          visitStart,
          visitEnd,
          priority,
        } = location || {};

        await new Promise((resolve, reject) => {
          locationStmt.run(
            locationName,
            locationDescription || null,
            visitStart || null,
            visitEnd || null,
            priority || 0,
            tripId,
            (err) => (err ? reject(err) : resolve())
          );
        });
      }

      locationStmt.finalize();
    }

    res.redirect(`/trips/trip/${tripId}`);
  } catch (err) {
    console.error('Failed to update trip or locations:', err);
    res.status(500).json({ error: 'Failed to update trip or locations' });
  }
});

export default router;
