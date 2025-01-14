import express from 'express';
import { db } from '../db/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/register', (req, res) => {
  const { login, email, password } = req.body;

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters.' });
  }

  db.get('SELECT * FROM users WHERE login = ?', [login], async (err, user) => {
    if (user) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (login, email, password) VALUES (?, ?, ?)',
      [login, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to register user.' });
        }

        const token = jwt.sign(
          { id: this.lastID, login },
          process.env.JWT_SECRET,
          { expiresIn: '60d' }
        );
        res.cookie('token', token, { httpOnly: true });
        res.status(200).redirect('/');
      }
    );
  });
});

router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    db.get(
      'SELECT * FROM users WHERE login = ?',
      [login],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
          return res.status(401).render('login', {
            error: 'Invalid login or password',
            title: 'Login',
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).render('login', {
            error: 'Invalid login or password',
            title: 'Login',
          });
        }

        const token = jwt.sign({ id: user.id, login }, process.env.JWT_SECRET, {
          expiresIn: '60d',
        });

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });

        res.redirect('/');
      }
    );
  } catch (error) {
    console.error('Error during login:', error);
    res
      .status(500)
      .json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true });
  res.redirect('/');
});

export default router;
