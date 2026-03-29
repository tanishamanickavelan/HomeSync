// routes/tasks.js
const express = require('express');
const { protect, requireFamily } = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
const router = express.Router();
router.use(protect, requireFamily);
router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
module.exports = router;
