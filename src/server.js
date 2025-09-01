import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import todosRouter from './routes/todos.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security headers
app.use(helmet());

// Small, fast compression for responses
app.use(compression());

// JSON parser
app.use(express.json());

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/todos', todosRouter);

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
