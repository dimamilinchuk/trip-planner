import express from 'express';
import usersRoutes from './users.js';
import tripsRoutes from './trips.js';
import locationsRoutes from './locations.js';
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
        .render('index', { title: 'Trip planner', user, trips: [] });
    }

    res.render('index', { title: 'Home', user, trips });
  });
});

router.use('/users', usersRoutes);
router.use('/trips', tripsRoutes);
router.use('/locations', locationsRoutes);

export default router;
