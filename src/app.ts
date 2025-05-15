import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupSwagger } from './middlewares/swagger.middleware.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
// import { requestLogger } from './middlewares/logging.middleware.js';
// import { metricsMiddleware } from './utils/metrics.js';

const app = express();

// Basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
// app.use(requestLogger);
// app.use(metricsMiddleware);

// Configure Swagger
setupSwagger(app);

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;