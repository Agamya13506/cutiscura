const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('login', { title: 'Login', message: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT user_id, name, email FROM users WHERE email = ? AND password = ? LIMIT 1',
      [email, password]
    );

    if (!rows.length) {
      return res.render('login', {
        title: 'Login',
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];
    req.session.user = {
      id: user.user_id,
      name: user.name,
      email: user.email
    };

    res.redirect('/');
  } catch (error) {
    console.error('Login error', error);
    res.render('login', { title: 'Login', message: 'Unable to login right now.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;

