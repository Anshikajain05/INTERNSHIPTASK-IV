import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { TodoStore } from '../store/todo-store.js';

const router = express.Router();
const store = new TodoStore();

/**
 * Validation result helper
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

/**
 * GET /api/todos
 * Queryable: ?q=... (search text)
 * This route uses a very small in-memory cache to serve repeated reads faster.
 */
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const items = await store.list({ q });
    res.json({ total: items.length, items });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/todos
 * Body: { title: string, completed?: boolean }
 */
router.post(
  '/',
  body('title').isString().isLength({ min: 1, max: 300 }),
  checkValidation,
  async (req, res, next) => {
    try {
      const { title, completed = false } = req.body;
      const created = await store.create({ title, completed });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/todos/:id
 */
router.get('/:id', param('id').isUUID(), checkValidation, async (req, res, next) => {
  try {
    const item = await store.get(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/todos/:id
 */
router.put(
  '/:id',
  param('id').isUUID(),
  body('title').optional().isString().isLength({ min: 1, max: 300 }),
  body('completed').optional().isBoolean(),
  checkValidation,
  async (req, res, next) => {
    try {
      const updated = await store.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/todos/:id
 */
router.delete('/:id', param('id').isUUID(), checkValidation, async (req, res, next) => {
  try {
    const deleted = await store.remove(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
