require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const quizRoutes = require('./routes/quiz');
const appointmentRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cutiscura-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/quiz', quizRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cutiscura running at http://localhost:${PORT}`);
});

