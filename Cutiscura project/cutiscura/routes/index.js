const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [[productCount]] = await db.query('SELECT COUNT(*) AS count FROM product');
    const [[userCount]] = await db.query('SELECT COUNT(*) AS count FROM users');
    const [[routineCount]] = await db.query('SELECT COUNT(*) AS count FROM routines');
    const [routineDetails] = await db.query(
      `SELECT r.routine_id,
              r.routine_name,
              r.time_of_day,
              u.name AS user_name,
              IFNULL(GROUP_CONCAT(p.name ORDER BY rp.step_order SEPARATOR ', '), 'Custom blend') AS products
       FROM routines r
       JOIN users u ON r.user_id = u.user_id
       LEFT JOIN routine_product rp ON r.routine_id = rp.routine_id
       LEFT JOIN product p ON rp.product_id = p.product_id
       GROUP BY r.routine_id, r.routine_name, r.time_of_day, u.name
       ORDER BY r.routine_id
       LIMIT 6`
    );

    res.render('index', {
      title: 'Dashboard',
      stats: {
        products: productCount.count,
        users: userCount.count,
        routines: routineCount.count
      },
      routines: routineDetails,
      error: null
    });
  } catch (error) {
    console.error('Error loading dashboard data', error);
    res.render('index', {
      title: 'Dashboard',
      stats: { products: 0, users: 0, routines: 0 },
      routines: [],
      error: 'Unable to load stats from the database.'
    });
  }
});

module.exports = router;

