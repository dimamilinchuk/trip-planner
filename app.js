import express from 'express';
import path from 'path';
import hbs from 'hbs';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authenticateUser } from './middleware/authenticateUser.js';
import { initDatabase } from './db/database.js';
import loadRoutes from './utils/loadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

initDatabase()
  .then(() => {
    console.log('Database initialized successfully.');
  })
  .catch((err) => {
    console.error('Error initializing database:', err);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(authenticateUser);

// Handlebars setup
app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'views'));
hbs.registerPartials(path.join(process.cwd(), 'views/partials'));
hbs.registerHelper('displayPlaces', function (number_of_places) {
  return number_of_places < 2 ? 1 : number_of_places;
});

//Importing rotues
await loadRoutes(app);

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
