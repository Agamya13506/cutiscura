const express = require('express');
const router = express.Router();
const db = require('../db');

async function fetchQuizData() {
  const [questions] = await db.query('SELECT * FROM quiz_question ORDER BY question_id');
  const [options] = await db.query('SELECT * FROM quiz_option ORDER BY question_id, option_id');

  return questions.map((question) => ({
    ...question,
    options: options.filter((option) => option.question_id === question.question_id)
  }));
}

router.get('/', async (req, res) => {
  try {
    const questions = await fetchQuizData();
    res.render('quiz', {
      title: 'Skin Quiz',
      questions,
      recommendations: null,
      score: null,
      message: null
    });
  } catch (error) {
    console.error('Error loading quiz', error);
    res.render('quiz', {
      title: 'Skin Quiz',
      questions: [],
      recommendations: null,
      score: null,
      message: 'Unable to load quiz at the moment.'
    });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const selectedOptionIds = Object.values(req.body).map((val) => Number(val)).filter(Boolean);
    const questions = await fetchQuizData();

    if (!selectedOptionIds.length) {
      return res.render('quiz', {
        title: 'Skin Quiz',
        questions,
        recommendations: null,
        score: null,
        message: 'Please answer all questions before submitting.'
      });
    }

    const [answers] = await db.query(
      'SELECT score_value FROM quiz_option WHERE option_id IN (?)',
      [selectedOptionIds]
    );

    const totalScore = answers.reduce((sum, row) => sum + (row.score_value || 0), 0);
    const [[user]] = await db.query('SELECT type_id FROM users WHERE user_id = 1');

    const [recommendations] = await db.query(
      `SELECT p.product_id, p.name, p.price
       FROM quiz_recommendation qr
       JOIN product p ON qr.product_id = p.product_id
       WHERE ? BETWEEN qr.min_score AND qr.max_score
         AND (qr.type_id IS NULL OR qr.type_id = ?)`,
      [totalScore, user?.type_id || null]
    );

    res.render('quiz', {
      title: 'Skin Quiz',
      questions,
      recommendations,
      score: totalScore,
      message: recommendations.length ? null : 'No recommendations found for this score.'
    });
  } catch (error) {
    console.error('Error submitting quiz', error);
    const questions = await fetchQuizData().catch(() => []);
    res.render('quiz', {
      title: 'Skin Quiz',
      questions,
      recommendations: null,
      score: null,
      message: 'Something went wrong calculating your results.'
    });
  }
});

module.exports = router;

