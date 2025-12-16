const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.product_id,
              p.name,
              p.brand,
              p.price,
              c.category_name,
              st.type_name,
              sc.concern_name
       FROM product p
       LEFT JOIN p_category c ON p.category_id = c.category_id
       LEFT JOIN skin_type st ON p.type_id = st.type_id
       LEFT JOIN skin_concern sc ON p.concern_id = sc.concern_id
       ORDER BY p.name`
    );

    res.render('products', { title: 'Products', products });
  } catch (error) {
    console.error('Error fetching products', error);
    res.render('products', { title: 'Products', products: [], error: 'Unable to load products.' });
  }
});

module.exports = router;

