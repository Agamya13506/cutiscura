const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.appointment_id,
              a.date,
              a.time,
              a.notes,
              u.name AS user_name,
              d.name AS derm_name
       FROM appointment a
       JOIN users u ON a.user_id = u.user_id
       JOIN dermat d ON a.derm_id = d.derm_id
       ORDER BY a.date, a.time`
    );

    const [users] = await db.query('SELECT user_id, name FROM users ORDER BY name');
    const [derms] = await db.query('SELECT derm_id, name FROM dermat ORDER BY name');

    res.render('appointments', {
      title: 'Appointments',
      appointments,
      users,
      derms,
      message: null
    });
  } catch (error) {
    console.error('Error loading appointments', error);
    res.render('appointments', {
      title: 'Appointments',
      appointments: [],
      users: [],
      derms: [],
      message: 'Unable to load appointments right now.'
    });
  }
});

module.exports = router;

