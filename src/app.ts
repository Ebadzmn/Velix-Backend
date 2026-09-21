import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { MorganErrorHandler, MorganSuccessHandler } from './shared/morgen';

const app: Application = express();

// Middlewares
app.use(MorganSuccessHandler);
app.use(MorganErrorHandler);
app.use(cors({ origin: '*', credentials: true }));
app.use(cookieParser());

// Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger API Documentation Setup
setupSwagger(app);

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Express TypeScript Backend API Server!',
    documentation: '/api-docs',
  });
});

// Application Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(globalErrorHandler);

// Handle Not Found Route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Route Not Found',
      },
    ],
  });
});

export default app;
