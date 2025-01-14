import request from 'supertest';
import express from 'express';
import tripsRouter from '../routes/trips.js';

let app;

jest.mock('../db/database.js', () => {
  const mockDb = {
    all: jest.fn((query, params, callback) => {
      if (query.includes('SELECT * FROM trips')) {
        callback(null, [{ id: 1, name: 'Test Trip', user_id: 1 }]); // Mocked data
      } else {
        callback(null, []);
      }
    }),
    run: jest.fn(function (query, params, callback) {
      if (query.includes('INSERT INTO trips')) {
        this.lastID = 1; // Mock lastID
        callback(null); // Simulate successful insertion
      } else if (query.includes('DELETE FROM trips')) {
        callback(null); // Simulate successful deletion
      } else {
        callback(new Error('Unknown query'));
      }
    }),
    get: jest.fn((query, params, callback) => {
      callback(null, { id: 1, name: 'Mock Trip' }); // Mocked single trip
    }),
    prepare: jest.fn(() => ({
      run: jest.fn(),
      finalize: jest.fn(),
    })),
    lastID: 1, // Simulate the last inserted ID
  };
  return { db: mockDb };
});

const { db } = require('../db/database.js');

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { id: 1, name: 'Test User' }; // Mock user
    next();
  });
  app.use('/trips', tripsRouter);
});

beforeEach(() => {
  jest.clearAllMocks(); // Reset mocks before each test
});

describe('Trips Module', () => {
  it('GET /trips - should return all trips for the user', async () => {
    const res = await request(app).get('/trips');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test Trip');
    expect(db.all).toHaveBeenCalledWith(
      'SELECT * FROM trips WHERE user_id = ?',
      [1],
      expect.any(Function)
    );
  });

  it('POST /trips/add - should add a new trip', async () => {
    const newTrip = {
      name: 'New Trip',
      description: 'A new trip for testing',
      country: 'Testland',
    };

    const res = await request(app).post('/trips/add').send(newTrip);
    expect(res.status).toBe(302); // Expect redirect after adding
    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO trips (name, description, country, last_open_time, number_of_places, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        newTrip.name,
        newTrip.description,
        newTrip.country,
        expect.any(Number),
        0,
        1,
      ],
      expect.any(Function)
    );
  });

  it('POST /trips/trip/:id/delete - should delete a trip', async () => {
    const tripId = '1'; // Use string for matching

    const res = await request(app).post(`/trips/trip/${tripId}/delete`);
    expect(res.status).toBe(302); // Expect redirect after deletion
    expect(db.run).toHaveBeenCalledWith(
      'DELETE FROM trips WHERE id = ? AND user_id = ?',
      ['1', 1], // String tripId
      expect.any(Function)
    );
    expect(db.run).toHaveBeenCalledWith(
      'DELETE FROM locations WHERE trip_id = ?',
      ['1'], // String tripId
      expect.any(Function)
    );
  });
});
